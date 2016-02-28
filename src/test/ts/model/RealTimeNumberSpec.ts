import DiscreteOperation from "../../../main/ts/model/ot/ops/DiscreteOperation";
import RealTimeNumber from "../../../main/ts/model/RealTimeNumber";
import NumberAddOperation from "../../../main/ts/model/ot/ops/NumberAddOperation";
import NumberSetOperation from "../../../main/ts/model/ot/ops/NumberSetOperation";
import ModelOperationEvent from "../../../main/ts/model/ModelOperationEvent";
import {NumberSetValueEvent} from "../../../main/ts/model/RealTimeNumber";
import {NumberAddEvent} from "../../../main/ts/model/RealTimeNumber";
import {ModelChangeEvent} from "../../../main/ts/model/events";

import * as chai from "chai";

var expect: any = chai.expect;

describe('RealTimeNumber', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var ignoreCallback: (op: DiscreteOperation) => void = (op: DiscreteOperation) => {
    // No Op
  };

  var lastOp: DiscreteOperation = null;
  var lastOpCallback: (op: DiscreteOperation) => void = (op: DiscreteOperation) => {
    lastOp = op;
  };

  var lastEvent: ModelChangeEvent = null;
  var lastEventCallback: (event: ModelChangeEvent) => void = (event: ModelChangeEvent) => {
    lastEvent = event;
  };

  it('Value is correct after creation', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(10, null, null, null, null);
    expect(myNumber.value()).to.equal(10);
  });

  it('Value is correct after add', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(10, null, null, ignoreCallback, null);
    myNumber.add(5);
    expect(myNumber.value()).to.equal(15);
  });

  it('Value is correct after subtract', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(10, null, null, ignoreCallback, null);
    myNumber.subtract(5);
    expect(myNumber.value()).to.equal(5);
  });

  it('Returned value is correct after set', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(10, null, null, ignoreCallback, null);
    myNumber.value(20);
    expect(myNumber.value()).to.equal(20);
  });

  it('Correct operation is sent after add', () => {
    lastOp = null;
    var myNumber: RealTimeNumber = new RealTimeNumber(10, null, null, lastOpCallback, null);
    myNumber.add(5);

    var expectedOp: NumberAddOperation = new NumberAddOperation([], false, 5);
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after subtract', () => {
    lastOp = null;
    var myNumber: RealTimeNumber = new RealTimeNumber(10, null, null, lastOpCallback, null);
    myNumber.subtract(5);

    var expectedOp: NumberAddOperation = new NumberAddOperation([], false, -5);
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after set', () => {
    lastOp = null;
    var myNumber: RealTimeNumber = new RealTimeNumber(10, null, null, lastOpCallback, null);
    myNumber.value(20);

    var expectedOp: NumberSetOperation = new NumberSetOperation([], false, 20);
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Value is correct after NumberAddOperation', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(10, null, null, null, null);

    var incomingOp: NumberAddOperation = new NumberAddOperation([], false, 5);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myNumber._handleRemoteOperation(incomingOp.path, incomingEvent);

    expect(myNumber.value()).to.equal(15);
  });

  it('Value is correct after NumberSetOperation', () => {
    var myNumber: RealTimeNumber = new RealTimeNumber(10, null, null, null, null);

    var incomingOp: NumberSetOperation = new NumberSetOperation([], false, 20);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myNumber._handleRemoteOperation(incomingOp.path, incomingEvent);

    expect(myNumber.value()).to.equal(20);
  });

  it('Correct Event is fired after NumberAddOperation', () => {
    lastEvent = null;
    var myNumber: RealTimeNumber = new RealTimeNumber(10, null, null, null, null);
    myNumber.on(RealTimeNumber.Events.ADD, lastEventCallback);

    var incomingOp: NumberAddOperation = new NumberAddOperation([], false, 5);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myNumber._handleRemoteOperation(incomingOp.path, incomingEvent);

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
    var myNumber: RealTimeNumber = new RealTimeNumber(10, null, null, null, null);
    myNumber.on(RealTimeNumber.Events.VALUE, lastEventCallback);

    var incomingOp: NumberSetOperation = new NumberSetOperation([], false, 20);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myNumber._handleRemoteOperation(incomingOp.path, incomingEvent);

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
