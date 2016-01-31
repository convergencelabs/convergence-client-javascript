var convergence = require("../../../../build/convergence-client");
var expect = require('chai').expect;

describe('RealTimeNumber', function () {
    var RealTimeNumber = convergence.model.RealTimeNumber;
    var NumberAddOperation = convergence.ot.NumberAddOperation;
    var NumberSetOperation = convergence.ot.NumberSetOperation;
    var ModelOperationEvent = convergence.model.ModelOperationEvent;
    var NumberAddEvent = convergence.model.event.NumberAddEvent;
    var NumberSetEvent = convergence.model.event.NumberSetEvent;

    var sessionId = "mySession";
    var username = "myUser";
    var version = 1;
    var timestamp = 100;

    var ignoreCallback = function(op) {};

    var lastOp = null;
    var lastOpCallback = function(op) {lastOp = op;};

    var lastEvent = null;
    var lastEventCallback = function(event) {lastEvent = event;};

    it('Value is correct after creation', function () {
        var myNumber = new RealTimeNumber(10, null, null, null);
        expect(myNumber.value()).to.equal(10);
    });

    it('Value is correct after add', function () {
        var myNumber = new RealTimeNumber(10, null, null, ignoreCallback);
        myNumber.add(5);
        expect(myNumber.value()).to.equal(15);
    });

    it('Value is correct after subtract', function () {
        var myNumber = new RealTimeNumber(10, null, null, ignoreCallback);
        myNumber.subtract(5);
        expect(myNumber.value()).to.equal(5);
    });

    it('Returned value is correct after set', function () {
        var myNumber = new RealTimeNumber(10, null, null, ignoreCallback);
        myNumber.setValue(20);
        expect(myNumber.value()).to.equal(20);
    });

    it('Correct operation is sent after add', function () {
        lastOp = null;
        var myNumber = new RealTimeNumber(10, null, null, lastOpCallback);
        myNumber.add(5);

        var expectedOp = new NumberAddOperation([], false, 5);
        expect(lastOp).to.deep.equal(expectedOp);
    });

    it('Correct operation is sent after subtract', function () {
        lastOp = null;
        var myNumber = new RealTimeNumber(10, null, null, lastOpCallback);
        myNumber.subtract(5);

        var expectedOp = new NumberAddOperation([], false, -5);
        expect(lastOp).to.deep.equal(expectedOp);
    });

    it('Correct operation is sent after set', function () {
        lastOp = null;
        var myNumber = new RealTimeNumber(10, null, null, lastOpCallback);
        myNumber.setValue(20);

        var expectedOp = new NumberSetOperation([], false, 20);
        expect(lastOp).to.deep.equal(expectedOp);
    });

    it('Value is correct after NumberAddOperation', function () {
        var myNumber = new RealTimeNumber(10, null, null, null);

        var incomingOp = new NumberAddOperation([], false, 5);
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myNumber._handleIncomingOperation(incomingEvent);

        expect(myNumber.value()).to.equal(15);
    });

    it('Value is correct after NumberSetOperation', function () {
        var myNumber = new RealTimeNumber(10, null, null, null);

        var incomingOp = new NumberSetOperation([], false, 20);
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myNumber._handleIncomingOperation(incomingEvent);

        expect(myNumber.value()).to.equal(20);
    });

    it('Correct Event is fired after NumberAddOperation', function () {
        lastEvent = null;
        var myNumber = new RealTimeNumber(10, null, null, null);
        myNumber.on("Add", lastEventCallback);

        var incomingOp = new NumberAddOperation([], false, 5);
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myNumber._handleIncomingOperation(incomingEvent);

        var expectedEvent = new NumberAddEvent(sessionId, username, version, timestamp, myNumber, 5);
        expect(lastEvent).to.deep.equal(expectedEvent);
    });

    it('Correct Event is fired after NumberSetOperation', function () {
        lastEvent = null;
        var myNumber = new RealTimeNumber(10, null, null, null);
        myNumber.on("Set", lastEventCallback);

        var incomingOp = new NumberSetOperation([], false, 20);
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myNumber._handleIncomingOperation(incomingEvent);

        var expectedEvent = new NumberSetEvent(sessionId, username, version, timestamp, myNumber, 20);
        expect(lastEvent).to.deep.equal(expectedEvent);
    });

});
