var convergence = require("../../../../build/convergence-client");
var expect = require('chai').expect;

describe('RealTimeBoolean', function () {
    var RealTimeBoolean = convergence.model.RealTimeBoolean;
    var BooleanSetOperation = convergence.ot.BooleanSetOperation;
    var ModelOperationEvent = convergence.model.ModelOperationEvent;
    var BooleanSetEvent = convergence.model.event.BooleanSetEvent;

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
        var myBoolean = new RealTimeBoolean(true, null, null, null);
        expect(myBoolean.value()).to.equal(true);
    });

    it('Value is correct after set', function () {
        var myBoolean = new RealTimeBoolean(true, null, null, ignoreCallback);
        myBoolean.setValue(false);
        expect(myBoolean.value()).to.equal(false);
    });

    it('Correct operation is sent after set', function () {
        lastOp = null;
        var myBoolean = new RealTimeBoolean(true, null, null, lastOpCallback);
        myBoolean.setValue(false);

        var expectedOp = new BooleanSetOperation([], false, false);
        expect(lastOp).to.deep.equal(expectedOp);
    });

    it('Value is correct after BooleanSetOperation', function () {
        var myBoolean = new RealTimeBoolean(true, null, null, null);

        var incomingOp = new BooleanSetOperation([], false, false);
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myBoolean._handleIncomingOperation(incomingEvent);

        expect(myBoolean.value()).to.equal(false);
    });

    it('Correct Event is fired after BooleanSetOperation', function () {
        lastEvent = null;
        var myBoolean = new RealTimeBoolean(true, null, null, null);
        myBoolean.on("Set", lastEventCallback);

        var incomingOp = new BooleanSetOperation([], false, false);
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myBoolean._handleIncomingOperation(incomingEvent);

        var expectedEvent = new BooleanSetEvent(sessionId, username, version, timestamp, myBoolean, false);
        expect(lastEvent).to.deep.equal(expectedEvent);
    });

});
