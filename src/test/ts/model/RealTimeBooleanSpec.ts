import {RealTimeBoolean} from "../../../main/ts/model/rt/RealTimeBoolean";
import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {BooleanSetOperation} from "../../../main/ts/model/ot/ops/BooleanSetOperation";
import {ModelEventCallbacks} from "../../../main/ts/model/rt/RealTimeModel";
import {TestIdGenerator} from "./TestIdGenerator";
import {BooleanValue} from "../../../main/ts/model/dataValue";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {RealTimeModel} from "../../../main/ts/model/rt/RealTimeModel";
import {Model} from "../../../main/ts/model/internal/Model";
import {BooleanNode} from "../../../main/ts/model/internal/BooleanNode";
import {RealTimeWrapperFactory} from "../../../main/ts/model/rt/RealTimeWrapperFactory";
import {ModelChangedEvent} from "../../../main/ts/model/modelEvents";
import {BooleanSetValueEvent} from "../../../main/ts/model/modelEvents";
import * as chai from "chai";
import * as sinon from "sinon";

let expect: any = chai.expect;

describe("RealTimeBoolean", () => {

  const sessionId: string = "mySession";
  const username: string = "myUser";
  const version: number = 1;
  const timestamp: number = 100;

  const gen: TestIdGenerator = new TestIdGenerator();

  const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
    return gen.id();
  });

  const model: Model = <Model> <any> sinon.createStubInstance(Model);
  const rtModel: RealTimeModel = <RealTimeModel> <any> sinon.createStubInstance(RealTimeModel);
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

  const initialValue: BooleanValue =
    <BooleanValue> dataValueFactory.createDataValue(true);

  let callbacks: ModelEventCallbacks;

  beforeEach(() => {
    callbacks = {
      sendOperationCallback: sinon.spy(),
      referenceEventCallbacks: {
        onShare: sinon.spy(),
        onUnshare: sinon.spy(),
        onSet: sinon.spy(),
        onClear: sinon.spy()
      }
    };
  });

  let lastEvent: ModelChangedEvent = null;
  let lastEventCallback: (event: ModelChangedEvent) => void = (event: ModelChangedEvent) => {
    lastEvent = event;
  };

  it("Value is correct after creation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: BooleanNode = new BooleanNode(initialValue, () => [], model, sessionId, username);
    const myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    expect(myBoolean.value()).to.equal(true);
  });

  it("Value is correct after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: BooleanNode = new BooleanNode(initialValue, () => [], model, sessionId, username);
    const myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    myBoolean.value(false);
    expect(myBoolean.value()).to.equal(false);
  });

  it("Correct operation is sent after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: BooleanNode = new BooleanNode(initialValue, () => [], model, sessionId, username);
    const myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    myBoolean.value(false);

    const expectedOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    expect((<any> callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it("Value is correct after BooleanSetOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: BooleanNode = new BooleanNode(initialValue, () => [], model, sessionId, username);
    const myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);

    const incomingOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myBoolean.value()).to.equal(false);
  });

  it("Correct Event is fired after BooleanSetOperation", () => {
    lastEvent = null;
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: BooleanNode = new BooleanNode(initialValue, () => [], model, sessionId, username);
    const myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    myBoolean.on(RealTimeBoolean.Events.VALUE, lastEventCallback);

    const incomingOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: BooleanSetValueEvent = new BooleanSetValueEvent(myBoolean, sessionId, username, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });
});
