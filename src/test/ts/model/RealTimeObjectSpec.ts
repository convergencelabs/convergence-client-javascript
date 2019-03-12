import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {RealTimeObject, ModelEventCallbacks, RealTimeModel} from "../../../main/ts/model/rt/";
import {ObjectSetOperation} from "../../../main/ts/model/ot/ops/ObjectSetOperation";
import {DataValue, ObjectValue, StringValue, DataValueType} from "../../../main/ts/model/dataValue";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {TestIdGenerator} from "./TestIdGenerator";
import {RealTimeWrapperFactory} from "../../../main/ts/model/rt/RealTimeWrapperFactory";
import {Model} from "../../../main/ts/model/internal/Model";
import {ObjectNode} from "../../../main/ts/model/internal/ObjectNode";
import {ObjectSetValueEvent} from "../../../main/ts/model/events/";
import {DomainUser} from "../../../main/ts/identity";
import {DomainUserType} from "../../../main/ts/identity/DomainUserId";
import {IdentityCache} from "../../../main/ts/identity/IdentityCache";
import {ConvergenceSession} from "../../../main/ts";

import {expect} from "chai";
import {SinonSpy, spy, createStubInstance} from "sinon";

describe("RealTimeObject", () => {

  // TODO most of this set up is common.
  const sessionId: string = "mySession";
  const username: string = "myUser";
  const user = new DomainUser(DomainUserType.NORMAL, username, "", "", "", "");
  const version: number = 1;
  const timestamp = new Date();

  let callbacks: ModelEventCallbacks;

  const gen: TestIdGenerator = new TestIdGenerator();

  const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
    return gen.id();
  });

  const identityCache: IdentityCache = createStubInstance(IdentityCache);
  const session: ConvergenceSession = createStubInstance(ConvergenceSession);
  const model: Model = createStubInstance(Model);
  const rtModel: RealTimeModel = createStubInstance(RealTimeModel);
  rtModel.emitLocalEvents = () => {
    return false;
  };
  rtModel.permissions = () => {
    return {
      read: true,
      write: true,
      remove: true,
      manage: true
    };
  };

  const initialValue = dataValueFactory.createDataValue({num: 5}) as ObjectValue;

  const setValue: { [key: string]: DataValue } = {
    string: dataValueFactory.createDataValue("test")
  };

  beforeEach(() => {
    callbacks = {
      sendOperationCallback: spy(),
      referenceEventCallbacks: {
        onShare: spy(),
        onUnshare: spy(),
        onSet: spy(),
        onClear: spy()
      }
    };
  });

  it("Get on missing value return UndefinedNode", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    expect(myObject.get("nonExistent").id()).to.deep.equal(undefined);
  });

  it("Value is correct after creation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    expect(myObject.value()).to.deep.equal({num: 5});
  });

  it("Value is correct after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    myObject.value({string: "test"});
    expect(myObject.value()).to.deep.equal({string: "test"});
  });

  it("Value is correct after setProperty", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    myObject.set("num", 10);
    expect(myObject.get("num").value()).to.deep.equal(10);
  });

  it("Correct operation is sent after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    myObject.value({string: "test"});

    const expectedDataValue: { [key: string]: DataValue } = {
      string: {id: myObject.get("string").id(), type: DataValueType.STRING, value: "test"} as StringValue
    };

    const opSpy  = callbacks.sendOperationCallback as SinonSpy;
    expect(opSpy.called).to.be.true;
    const expectedOp: ObjectSetOperation = new ObjectSetOperation(myObject.id(), false, expectedDataValue);
    expect(opSpy.args[0][0]).to.deep.equal(expectedOp);
  });

  it("Value is correct after ObjectSetOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;

    const incomingOp: ObjectSetOperation = new ObjectSetOperation(initialValue.id, false, setValue);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myObject.value()).to.deep.equal({string: "test"});
  });

  it("Correct Event is fired after ObjectSetOperation", () => {
    const eventCallback: SinonSpy = spy();
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ObjectNode = new ObjectNode(initialValue, () => [], model, session, dataValueFactory);
    const myObject: RealTimeObject = wrapperFactory.wrap(delegate) as RealTimeObject;
    myObject.on(RealTimeObject.Events.VALUE, eventCallback);

    const incomingOp: ObjectSetOperation = new ObjectSetOperation(initialValue.id, false, setValue);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: ObjectSetValueEvent = {
      element: myObject,
      name: RealTimeObject.Events.VALUE,
      sessionId,
      user,
      local: false
    };
    expect(eventCallback.lastCall.args[0]).to.deep.equal(expectedEvent);
  });
});
