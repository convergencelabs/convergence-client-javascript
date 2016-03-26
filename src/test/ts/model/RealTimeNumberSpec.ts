import RealTimeNumber from "../../../main/ts/model/RealTimeNumber";
import NumberAddOperation from "../../../main/ts/model/ot/ops/NumberAddOperation";
import NumberSetOperation from "../../../main/ts/model/ot/ops/NumberSetOperation";
import ModelOperationEvent from "../../../main/ts/model/ModelOperationEvent";
import {NumberSetValueEvent} from "../../../main/ts/model/RealTimeNumber";
import {NumberAddEvent} from "../../../main/ts/model/RealTimeNumber";
import {ModelChangeEvent} from "../../../main/ts/model/events";

import * as chai from "chai";
import * as sinon from "sinon";
import {ModelEventCallbacks} from "../../../main/ts/model/RealTimeModel";
import {NumberValue} from "../../../main/ts/connection/protocol/model/dataValue";
import {TestIdGenerator} from "./TestIdGenerator";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {RealTimeModel} from "../../../main/ts/model/RealTimeModel";

var expect: any = chai.expect;

describe('RealTimeNumber', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var gen: TestIdGenerator = new TestIdGenerator();
  var idGenerator: () => string = () => {
    return gen.id();
  };

  var model: RealTimeModel = <RealTimeModel><any>sinon.createStubInstance(RealTimeModel);

  var initialValue: NumberValue =
    <NumberValue>DataValueFactory.createDataValue(10, idGenerator);

  var callbacks: ModelEventCallbacks;

  beforeEach(function (): void {
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

  var lastEvent: ModelChangeEvent = null;
  var lastEventCallback: (event: ModelChangeEvent) => void = (event: ModelChangeEvent) => {
    lastEvent = event;
  };

  it('Value is correct after creation', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(initialValue, null, null, null, model);
    expect(myNumber.value()).to.equal(10);
  });

  it('Value is correct after add', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(initialValue, null, null, callbacks, model);
    myNumber.add(5);
    expect(myNumber.value()).to.equal(15);
  });

  it('Value is correct after subtract', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(initialValue, null, null, callbacks, model);
    myNumber.subtract(5);
    expect(myNumber.value()).to.equal(5);
  });

  it('Returned value is correct after set', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(initialValue, null, null, callbacks, model);
    myNumber.value(20);
    expect(myNumber.value()).to.equal(20);
  });

  it('Correct operation is sent after add', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(initialValue, null, null, callbacks, model);
    myNumber.add(5);

    // var expectedOp: NumberAddOperation = new NumberAddOperation(initialValue.id, false, 5);
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after subtract', () => {

    var myNumber: RealTimeNumber = new RealTimeNumber(initialValue, null, null, callbacks, model);
    myNumber.subtract(5);

    // var expectedOp: NumberAddOperation = new NumberAddOperation(initialValue.id, false, -5);
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after set', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(initialValue, null, null, callbacks, model);
    myNumber.value(20);

    // var expectedOp: NumberSetOperation = new NumberSetOperation(initialValue.id, false, 20);
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Value is correct after NumberAddOperation', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(initialValue, null, null, null, model);

    var incomingOp: NumberAddOperation = new NumberAddOperation(initialValue.id, false, 5);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myNumber._handleRemoteOperation(incomingEvent);

    expect(myNumber.value()).to.equal(15);
  });

  it('Value is correct after NumberSetOperation', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(initialValue, null, null, null, model);

    var incomingOp: NumberSetOperation = new NumberSetOperation(initialValue.id, false, 20);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myNumber._handleRemoteOperation(incomingEvent);

    expect(myNumber.value()).to.equal(20);
  });

  it('Correct Event is fired after NumberAddOperation', () => {
    lastEvent = null;
    var myNumber: RealTimeNumber = new RealTimeNumber(initialValue, null, null, null, model);
    myNumber.on(RealTimeNumber.Events.ADD, lastEventCallback);

    var incomingOp: NumberAddOperation = new NumberAddOperation(initialValue.id, false, 5);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myNumber._handleRemoteOperation(incomingEvent);

    var expectedEvent: NumberAddEvent = {
      src: myNumber,
      name: RealTimeNumber.Events.ADD,
      sessionId: sessionId,
      userId: username,
      version: version,
      timestamp: timestamp,
      value: 5
    };
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct Event is fired after NumberSetOperation', () => {
    lastEvent = null;
    var myNumber: RealTimeNumber = new RealTimeNumber(initialValue, null, null, null, model);
    myNumber.on(RealTimeNumber.Events.VALUE, lastEventCallback);

    var incomingOp: NumberSetOperation = new NumberSetOperation(initialValue.id, false, 20);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myNumber._handleRemoteOperation(incomingEvent);

    var expectedEvent: NumberSetValueEvent = {
      src: myNumber,
      name: RealTimeNumber.Events.VALUE,
      sessionId: sessionId,
      userId: username,
      version: version,
      timestamp: timestamp,
      value: 20
    };
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

});
