import DiscreteOperation from "../../../main/ts/ot/ops/DiscreteOperation";
import ModelChangeEvent from "../../../main/ts/model/events/ModelChangeEvent";
import RealTimeArray from "../../../main/ts/model/RealTimeArray";
import ArraySetOperation from "../../../main/ts/ot/ops/ArraySetOperation";
import ArrayInsertOperation from "../../../main/ts/ot/ops/ArrayInsertOperation";
import ArrayRemoveOperation from "../../../main/ts/ot/ops/ArrayRemoveOperation";
import ArrayReplaceOperation from "../../../main/ts/ot/ops/ArrayReplaceOperation";
import ArrayMoveOperation from "../../../main/ts/ot/ops/ArrayMoveOperation";
import ModelOperationEvent from "../../../main/ts/model/ModelOperationEvent";
import ArraySetEvent from "../../../main/ts/model/events/ArraySetEvent";
import ArrayInsertEvent from "../../../main/ts/model/events/ArrayInsertEvent";
import ArrayRemoveEvent from "../../../main/ts/model/events/ArrayRemoveEvent";
import ArrayReplaceEvent from "../../../main/ts/model/events/ArrayReplaceEvent";
import ArrayMoveEvent from "../../../main/ts/model/events/ArrayMoveEvent";

import * as chai from "chai";
var expect: any = chai.expect;

describe('RealTimeArray', () => {


  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var ignoreCallback: (op: DiscreteOperation) => void = (op: DiscreteOperation) => {
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
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    expect(myArray.value()).to.deep.equal(["A", "B", "C"]);
  });

  it('Value is correct after set', () => {
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, ignoreCallback);
    myArray.setValue(["X", "Y", "Z"]);
    expect(myArray.value()).to.deep.equal(["X", "Y", "Z"]);
  });

  it('Value is correct after insert', () => {
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, ignoreCallback);
    myArray.insert(2, "X");
    expect(myArray.value()).to.deep.equal(["A", "B", "X", "C"]);
  });

  it('Value is correct after remove', () => {
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, ignoreCallback);
    myArray.remove(1);
    expect(myArray.value()).to.deep.equal(["A", "C"]);
  });

  it('Value is correct after replace', () => {
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, ignoreCallback);
    myArray.replace(1, "X");
    expect(myArray.value()).to.deep.equal(["A", "X", "C"]);
  });

  it('Value is correct after move', () => {
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, ignoreCallback);
    myArray.move(1, 2);
    expect(myArray.value()).to.deep.equal(["A", "C", "B"]);
  });

  it('Correct operation is sent after set', () => {
    lastOp = null;
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, lastOpCallback);
    myArray.setValue(["X", "Y", "Z"]);

    var expectedOp: ArraySetOperation = new ArraySetOperation([], false, ["X", "Y", "Z"]);
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after insert', () => {
    lastOp = null;
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, lastOpCallback);
    myArray.insert(2, "X");

    var expectedOp: ArrayInsertOperation = new ArrayInsertOperation([], false, 2, "X");
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after remove', () => {
    lastOp = null;
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, lastOpCallback);
    myArray.remove(1);

    var expectedOp: ArrayRemoveOperation = new ArrayRemoveOperation([], false, 1);
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after replace', () => {
    lastOp = null;
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, lastOpCallback);
    myArray.replace(1, "X");

    var expectedOp: ArrayReplaceOperation = new ArrayReplaceOperation([], false, 1, "X");
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after move', () => {
    lastOp = null;
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, lastOpCallback);
    myArray.move(1, 2);

    var expectedOp: ArrayMoveOperation = new ArrayMoveOperation([], false, 1, 2);
    expect(lastOp).to.deep.equal(expectedOp);
  });


  it('Value is correct after ArraySetOperation', () => {
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, null);

    var incomingOp: ArraySetOperation = new ArraySetOperation([], false, ["X", "Y", "Z"]);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["X", "Y", "Z"]);
  });

  it('Value is correct after ArrayInsertOperation', () => {
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, null);

    var incomingOp: ArrayInsertOperation = new ArrayInsertOperation([], false, 2, "X");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "B", "X", "C"]);
  });

  it('Value is correct after ArrayRemoveOperation', () => {
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, null);

    var incomingOp: ArrayRemoveOperation = new ArrayRemoveOperation([], false, 1);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "C"]);
  });

  it('Value is correct after ArrayReplaceOperation', () => {
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, null);

    var incomingOp: ArrayReplaceOperation = new ArrayReplaceOperation([], false, 1, "X");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "X", "C"]);
  });

  it('Value is correct after ArrayMoveOperation', () => {
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, null);

    var incomingOp: ArrayMoveOperation = new ArrayMoveOperation([], false, 1, 2);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "C", "B"]);
  });

  it('Correct event is fired after ArraySetOperation', () => {
    lastEvent = null;
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    myArray.on("Set", lastEventCallback);

    var incomingOp: ArraySetOperation = new ArraySetOperation([], false, ["X", "Y", "Z"]);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    var expectedEvent: ArraySetEvent = new ArraySetEvent(sessionId, username, version, timestamp, myArray, ["X", "Y", "Z"]);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayInsertOperation', () => {
    lastEvent = null;
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    myArray.on("Insert", lastEventCallback);

    var incomingOp: ArrayInsertOperation = new ArrayInsertOperation([], false, 2, "X");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    var expectedEvent: ArrayInsertEvent = new ArrayInsertEvent(sessionId, username, version, timestamp, myArray, 2, "X");
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayRemoveOperation', () => {
    lastEvent = null;
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    myArray.on("Remove", lastEventCallback);

    var incomingOp: ArrayRemoveOperation = new ArrayRemoveOperation([], false, 1);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    var expectedEvent: ArrayRemoveEvent = new ArrayRemoveEvent(sessionId, username, version, timestamp, myArray, 1);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayReplaceOperation', () => {
    lastEvent = null;
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    myArray.on("Replace", lastEventCallback);

    var incomingOp: ArrayReplaceOperation = new ArrayReplaceOperation([], false, 1, "X");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    var expectedEvent: ArrayReplaceEvent = new ArrayReplaceEvent(sessionId, username, version, timestamp, myArray, 1, "X");
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayMoveOperation', () => {
    lastEvent = null;
    var myArray: RealTimeArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    myArray.on("Move", lastEventCallback);

    var incomingOp: ArrayMoveOperation = new ArrayMoveOperation([], false, 1, 2);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    var expectedEvent: ArrayMoveEvent = new ArrayMoveEvent(sessionId, username, version, timestamp, myArray, 1, 2);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

});
