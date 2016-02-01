var convergence = require("../../../../build/convergence-client");
var expect = require('chai').expect;

describe('RealTimeArray', function () {
  var RealTimeArray = convergence.model.RealTimeArray;
  var ArraySetOperation = convergence.ot.ArraySetOperation;
  var ArrayInsertOperation = convergence.ot.ArrayInsertOperation;
  var ArrayRemoveOperation = convergence.ot.ArrayRemoveOperation;
  var ArrayReplaceOperation = convergence.ot.ArrayReplaceOperation;
  var ArrayMoveOperation = convergence.ot.ArrayMoveOperation;
  var ModelOperationEvent = convergence.model.ModelOperationEvent;
  var ArraySetEvent = convergence.model.event.ArraySetEvent;
  var ArrayInsertEvent = convergence.model.event.ArrayInsertEvent;
  var ArrayRemoveEvent = convergence.model.event.ArrayRemoveEvent;
  var ArrayReplaceEvent = convergence.model.event.ArrayReplaceEvent;
  var ArrayMoveEvent = convergence.model.event.ArrayMoveEvent;


  var sessionId = "mySession";
  var username = "myUser";
  var version = 1;
  var timestamp = 100;

  var ignoreCallback = function (op) {
  };

  var lastOp = null;
  var lastOpCallback = function (op) {
    lastOp = op;
  };

  var lastEvent = null;
  var lastEventCallback = function (event) {
    lastEvent = event;
  };

  it('Value is correct after creation', function () {
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    expect(myArray.value()).to.deep.equal(["A", "B", "C"]);
  });

  it('Value is correct after set', function () {
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, ignoreCallback);
    myArray.setValue(["X", "Y", "Z"]);
    expect(myArray.value()).to.deep.equal(["X", "Y", "Z"]);
  });

  it('Value is correct after insert', function () {
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, ignoreCallback);
    myArray.insert(2, "X");
    expect(myArray.value()).to.deep.equal(["A", "B", "X", "C"]);
  });

  it('Value is correct after remove', function () {
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, ignoreCallback);
    myArray.remove(1);
    expect(myArray.value()).to.deep.equal(["A", "C"]);
  });

  it('Value is correct after replace', function () {
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, ignoreCallback);
    myArray.replace(1, "X")
    expect(myArray.value()).to.deep.equal(["A", "X", "C"]);
  });

  it('Value is correct after move', function () {
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, ignoreCallback);
    myArray.move(1, 2)
    expect(myArray.value()).to.deep.equal(["A", "C", "B"]);
  });

  it('Correct operation is sent after set', function () {
    lastOp = null;
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, lastOpCallback);
    myArray.setValue(["X", "Y", "Z"]);

    var expectedOp = new ArraySetOperation([], false, ["X", "Y", "Z"]);
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after insert', function () {
    lastOp = null;
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, lastOpCallback);
    myArray.insert(2, "X");

    var expectedOp = new ArrayInsertOperation([], false, 2, "X");
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after remove', function () {
    lastOp = null;
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, lastOpCallback);
    myArray.remove(1);

    var expectedOp = new ArrayRemoveOperation([], false, 1);
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after replace', function () {
    lastOp = null;
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, lastOpCallback);
    myArray.replace(1, "X");

    var expectedOp = new ArrayReplaceOperation([], false, 1, "X");
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after move', function () {
    lastOp = null;
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, lastOpCallback);
    myArray.move(1, 2);

    var expectedOp = new ArrayMoveOperation([], false, 1, 2);
    expect(lastOp).to.deep.equal(expectedOp);
  });


  it('Value is correct after ArraySetOperation', function () {
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, null);

    var incomingOp = new ArraySetOperation([], false, ["X", "Y", "Z"]);
    var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["X", "Y", "Z"]);
  });

  it('Value is correct after ArrayInsertOperation', function () {
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, null);

    var incomingOp = new ArrayInsertOperation([], false, 2, "X");
    var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "B", "X", "C"]);
  });

  it('Value is correct after ArrayRemoveOperation', function () {
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, null);

    var incomingOp = new ArrayRemoveOperation([], false, 1);
    var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "C"]);
  });

  it('Value is correct after ArrayReplaceOperation', function () {
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, null);

    var incomingOp = new ArrayReplaceOperation([], false, 1, "X");
    var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "X", "C"]);
  });

  it('Value is correct after ArrayMoveOperation', function () {
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, null);

    var incomingOp = new ArrayMoveOperation([], false, 1, 2);
    var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "C", "B"]);
  });

  it('Correct event is fired after ArraySetOperation', function () {
    lastEvent = null;
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    myArray.on("Set", lastEventCallback);

    var incomingOp = new ArraySetOperation([], false, ["X", "Y", "Z"]);
    var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    var expectedEvent = new ArraySetEvent(sessionId, username, version, timestamp, myArray, ["X", "Y", "Z"]);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayInsertOperation', function () {
    lastEvent = null;
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    myArray.on("Insert", lastEventCallback);

    var incomingOp = new ArrayInsertOperation([], false, 2, "X");
    var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    var expectedEvent = new ArrayInsertEvent(sessionId, username, version, timestamp, myArray, 2, "X");
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayRemoveOperation', function () {
    lastEvent = null;
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    myArray.on("Remove", lastEventCallback);

    var incomingOp = new ArrayRemoveOperation([], false, 1);
    var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    var expectedEvent = new ArrayRemoveEvent(sessionId, username, version, timestamp, myArray, 1);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayReplaceOperation', function () {
    lastEvent = null;
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    myArray.on("Replace", lastEventCallback);

    var incomingOp = new ArrayReplaceOperation([], false, 1, "X");
    var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    var expectedEvent = new ArrayReplaceEvent(sessionId, username, version, timestamp, myArray, 1, "X");
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayMoveOperation', function () {
    lastEvent = null;
    var myArray = new RealTimeArray(["A", "B", "C"], null, null, null);
    myArray.on("Move", lastEventCallback);

    var incomingOp = new ArrayMoveOperation([], false, 1, 2);
    var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleIncomingOperation(incomingEvent);

    var expectedEvent = new ArrayMoveEvent(sessionId, username, version, timestamp, myArray, 1, 2);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

});
