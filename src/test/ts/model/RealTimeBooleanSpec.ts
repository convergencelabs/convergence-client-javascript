import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {BooleanSetOperation} from "../../../main/ts/model/ot/ops/BooleanSetOperation";
import {RealTimeModel, ModelEventCallbacks, RealTimeBoolean} from "../../../main/ts/model/rt/";
import {TestIdGenerator} from "./TestIdGenerator";
import {BooleanValue} from "../../../main/ts/model/dataValue";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {Model} from "../../../main/ts/model/internal/Model";
import {BooleanNode} from "../../../main/ts/model/internal/BooleanNode";
import {RealTimeWrapperFactory} from "../../../main/ts/model/rt/RealTimeWrapperFactory";
import {ModelChangedEvent, BooleanSetValueEvent} from "../../../main/ts/model/events/";
import {DomainUser, DomainUserType} from "../../../main/ts/identity";
import {IdentityCache} from "../../../main/ts/identity/IdentityCache";
import {ConvergenceSession} from "../../../main/ts";

import {expect} from "chai";
import {SinonSpy, spy, createStubInstance} from "sinon";

describe("RealTimeBoolean", () => {

  const sessionId: string = "mySession";
  const username: string = "myUser";
  const user = new DomainUser(DomainUserType.NORMAL, username, "", "", "", "");
  const version: number = 1;
  const timestamp = new Date();

  const gen: TestIdGenerator = new TestIdGenerator();

  const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
    return gen.id();
  });

  const model = createStubInstance(Model) as any as Model;
  const identityCache = createStubInstance(IdentityCache) as any as IdentityCache;
  const session = createStubInstance(ConvergenceSession) as any as ConvergenceSession;
  const rtModel = createStubInstance(RealTimeModel) as any as RealTimeModel;
  rtModel.emitLocalEvents = () => {
    return false;
  };
  rtModel.permissions = () => {
    return  {
      read: true,
      write: true,
      remove: true,
      manage: true
    };
  };

  const initialValue: BooleanValue = dataValueFactory.createDataValue(true) as BooleanValue;

  let callbacks: ModelEventCallbacks;

  beforeEach(() => {
    callbacks = {
      sendOperationCallback: spy(),
      referenceEventCallbacks: {
        onShare: spy(),
        onUnShare: spy(),
        onSet: spy(),
        onClear: spy()
      }
    };
  });

  let lastEvent: ModelChangedEvent = null;
  const lastEventCallback: (event: ModelChangedEvent) => void = (event: ModelChangedEvent) => {
    lastEvent = event;
  };

  it("Value is correct after creation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: BooleanNode = new BooleanNode(initialValue, () => [], model, session);
    const myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    expect(myBoolean.value()).to.equal(true);
  });

  it("Value is correct after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: BooleanNode = new BooleanNode(initialValue, () => [], model, session);
    const myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    myBoolean.value(false);
    expect(myBoolean.value()).to.equal(false);
  });

  it("Correct operation is sent after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: BooleanNode = new BooleanNode(initialValue, () => [], model, session);
    const myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    myBoolean.value(false);

    const expectedOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    expect((callbacks.sendOperationCallback as SinonSpy).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it("Value is correct after BooleanSetOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: BooleanNode = new BooleanNode(initialValue, () => [], model, session);
    const myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);

    const incomingOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myBoolean.value()).to.equal(false);
  });

  it("Correct Event is fired after BooleanSetOperation", () => {
    lastEvent = null;
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: BooleanNode = new BooleanNode(initialValue, () => [], model, session);
    const myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    myBoolean.on(RealTimeBoolean.Events.VALUE, lastEventCallback);

    const incomingOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: BooleanSetValueEvent = new BooleanSetValueEvent(myBoolean, user, sessionId, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });
});
