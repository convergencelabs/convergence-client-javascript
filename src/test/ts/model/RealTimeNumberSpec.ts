import {RealTimeNumber} from "../../../main/ts/model/rt/RealTimeNumber";
import {NumberAddOperation} from "../../../main/ts/model/ot/ops/NumberAddOperation";
import {NumberSetOperation} from "../../../main/ts/model/ot/ops/NumberSetOperation";
import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {ModelEventCallbacks} from "../../../main/ts/model/rt/RealTimeModel";
import {NumberValue} from "../../../main/ts/model/dataValue";
import {TestIdGenerator} from "./TestIdGenerator";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {RealTimeModel} from "../../../main/ts/model/rt/RealTimeModel";
import {Model} from "../../../main/ts/model/internal/Model";
import {NumberNode} from "../../../main/ts/model/internal/NumberNode";
import {RealTimeWrapperFactory} from "../../../main/ts/model/rt/RealTimeWrapperFactory";
import {ModelChangedEvent} from "../../../main/ts/model/modelEvents";
import {NumberDeltaEvent} from "../../../main/ts/model/modelEvents";
import {NumberSetValueEvent} from "../../../main/ts/model/modelEvents";

import * as chai from "chai";
import * as sinon from "sinon";
const expect: any = chai.expect;

describe("RealTimeNumber", () => {

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

  const initialValue: NumberValue =
    <NumberValue> dataValueFactory.createDataValue(10);

  let callbacks: ModelEventCallbacks;
  beforeEach( () => {
    callbacks = {
      sendOperationCallback: sinon.spy(),
      referenceEventCallbacks: {
        onPublish: sinon.spy(),
        onUnpublish: sinon.spy(),
        onSet: sinon.spy(),
        onClear: sinon.spy()
      }
    };
  });

  let lastEvent: ModelChangedEvent = null;
  const lastEventCallback: (event: ModelChangedEvent) => void = (event: ModelChangedEvent) => {
    lastEvent = event;
  };

  it("Value is correct after creation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: NumberNode = new NumberNode(initialValue, () => { return []; }, model, sessionId, username);
    const myNumber: RealTimeNumber = <RealTimeNumber> wrapperFactory.wrap(delegate);
    expect(myNumber.value()).to.equal(10);
  });

  it("Value is correct after add", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: NumberNode = new NumberNode(initialValue, () => { return []; }, model, sessionId, username);
    const myNumber: RealTimeNumber = <RealTimeNumber> wrapperFactory.wrap(delegate);
    myNumber.add(5);
    expect(myNumber.value()).to.equal(15);
  });

  it("Value is correct after subtract", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: NumberNode = new NumberNode(initialValue, () => { return []; }, model, sessionId, username);
    const myNumber: RealTimeNumber = <RealTimeNumber> wrapperFactory.wrap(delegate);
    myNumber.subtract(5);
    expect(myNumber.value()).to.equal(5);
  });

  it("Returned value is correct after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: NumberNode = new NumberNode(initialValue, () => { return []; }, model, sessionId, username);
    const myNumber: RealTimeNumber = <RealTimeNumber> wrapperFactory.wrap(delegate);
    myNumber.value(20);
    expect(myNumber.value()).to.equal(20);
  });

  it("Correct operation is sent after add", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: NumberNode = new NumberNode(initialValue, () => { return []; }, model, sessionId, username);
    const myNumber: RealTimeNumber = <RealTimeNumber> wrapperFactory.wrap(delegate);
    myNumber.add(5);

    // const expectedOp: NumberAddOperation = new NumberAddOperation(initialValue.id, false, 5);
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it("Correct operation is sent after subtract", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: NumberNode = new NumberNode(initialValue, () => { return []; }, model, sessionId, username);
    const myNumber: RealTimeNumber = <RealTimeNumber> wrapperFactory.wrap(delegate);
    myNumber.subtract(5);

    // const expectedOp: NumberAddOperation = new NumberAddOperation(initialValue.id, false, -5);
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it("Correct operation is sent after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: NumberNode = new NumberNode(initialValue, () => { return []; }, model, sessionId, username);
    const myNumber: RealTimeNumber = <RealTimeNumber> wrapperFactory.wrap(delegate);
    myNumber.value(20);

    // const expectedOp: NumberSetOperation = new NumberSetOperation(initialValue.id, false, 20);
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it("Value is correct after NumberAddOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: NumberNode = new NumberNode(initialValue, () => {return [];}, model, sessionId, username);
    const myNumber: RealTimeNumber = <RealTimeNumber> wrapperFactory.wrap(delegate);

    const incomingOp: NumberAddOperation = new NumberAddOperation(initialValue.id, false, 5);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myNumber.value()).to.equal(15);
  });

  it("Value is correct after NumberSetOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: NumberNode = new NumberNode(initialValue, () => {return [];}, model, sessionId, username);
    const myNumber: RealTimeNumber = <RealTimeNumber> wrapperFactory.wrap(delegate);

    const incomingOp: NumberSetOperation = new NumberSetOperation(initialValue.id, false, 20);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);

    delegate._handleModelOperationEvent(incomingEvent);

    expect(myNumber.value()).to.equal(20);
  });

  it("Correct Event is fired after NumberAddOperation", () => {
    lastEvent = null;
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: NumberNode = new NumberNode(initialValue, () => {return [];}, model, sessionId, username);
    const myNumber: RealTimeNumber = <RealTimeNumber> wrapperFactory.wrap(delegate);
    myNumber.on(RealTimeNumber.Events.DELTA, lastEventCallback);

    const incomingOp: NumberAddOperation = new NumberAddOperation(initialValue.id, false, 5);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: NumberDeltaEvent = new NumberDeltaEvent(myNumber, 5, sessionId, username, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it("Correct Event is fired after NumberSetOperation", () => {
    lastEvent = null;
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: NumberNode = new NumberNode(initialValue, () => {return [];}, model, sessionId, username);
    const myNumber: RealTimeNumber = <RealTimeNumber> wrapperFactory.wrap(delegate);
    myNumber.on(RealTimeNumber.Events.VALUE, lastEventCallback);

    const incomingOp: NumberSetOperation = new NumberSetOperation(initialValue.id, false, 20);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: NumberSetValueEvent =
      new NumberSetValueEvent(myNumber, sessionId, username, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

});
