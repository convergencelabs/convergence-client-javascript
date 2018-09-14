import {RealTimeDate} from "../../../main/ts/model/rt/RealTimeDate";
import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {DateSetOperation} from "../../../main/ts/model/ot/ops/DateSetOperation";
import {ModelEventCallbacks} from "../../../main/ts/model/rt/RealTimeModel";
import {TestIdGenerator} from "./TestIdGenerator";
import {DateValue} from "../../../main/ts/model/dataValue";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {RealTimeModel} from "../../../main/ts/model/rt/RealTimeModel";
import {Model} from "../../../main/ts/model/internal/Model";
import {DateNode} from "../../../main/ts/model/internal/DateNode";
import {RealTimeWrapperFactory} from "../../../main/ts/model/rt/RealTimeWrapperFactory";
import {ModelChangedEvent} from "../../../main/ts/model/events/ModelChangedEvent";
import {DateSetValueEvent} from "../../../main/ts/model/events/DateSetValueEvent";
import * as chai from "chai";
import * as sinon from "sinon";

let expect: any = chai.expect;

describe("RealTimeDate", () => {

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

  const testDate = new Date();

  const initialValue: DateValue =
    <DateValue> dataValueFactory.createDataValue(testDate);

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
    const delegate: DateNode = new DateNode(initialValue, () => [], model, sessionId, username);
    const myDate: RealTimeDate = wrapperFactory.wrap(delegate);
    expect(myDate.value()).to.equal(testDate);
  });

  it("Value is correct after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: DateNode = new DateNode(initialValue, () => [], model, sessionId, username);
    const myDate: RealTimeDate = wrapperFactory.wrap(delegate);
    const now = new Date();
    myDate.value(now);
    expect(myDate.value()).to.equal(now);
  });

  it("Correct operation is sent after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: DateNode = new DateNode(initialValue, () => [], model, sessionId, username);
    const myDate: RealTimeDate = wrapperFactory.wrap(delegate);
    const now = new Date();
    myDate.value(now);

    const expectedOp: DateSetOperation = new DateSetOperation(initialValue.id, false, now);
    expect((<any> callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it("Value is correct after DateSetOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: DateNode = new DateNode(initialValue, () => [], model, sessionId, username);
    const myDate: RealTimeDate = wrapperFactory.wrap(delegate);

    const now = new Date();
    const incomingOp: DateSetOperation = new DateSetOperation(initialValue.id, false, now);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myDate.value()).to.equal(now);
  });

  it("Correct Event is fired after DateSetOperation", () => {
    lastEvent = null;
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: DateNode = new DateNode(initialValue, () => [], model, sessionId, username);
    const myDate: RealTimeDate = wrapperFactory.wrap(delegate);
    myDate.on(RealTimeDate.Events.VALUE, lastEventCallback);

    const now = new Date();
    const incomingOp: DateSetOperation = new DateSetOperation(initialValue.id, false, now);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: DateSetValueEvent = new DateSetValueEvent(myDate, sessionId, username, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });
});
