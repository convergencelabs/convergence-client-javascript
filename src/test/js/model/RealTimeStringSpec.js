var convergence = require("../../../../build/convergence-client");
var expect = require('chai').expect;

describe('RealTimeString', function () {
    var RealTimeString = convergence.model.RealTimeString;
    var StringSetOperation = convergence.ot.StringSetOperation;
    var StringInsertOperation = convergence.ot.StringInsertOperation;
    var StringRemoveOperation = convergence.ot.StringRemoveOperation;
    var ModelOperationEvent = convergence.model.ModelOperationEvent;
    var StringSetEvent = convergence.model.event.StringSetEvent;
    var StringInsertEvent = convergence.model.event.StringInsertEvent;
    var StringRemoveEvent = convergence.model.event.StringRemoveEvent;


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
        var myString = new RealTimeString("MyString", null, null, null);
        expect(myString.value()).to.equal("MyString");
    });

    it('Value is correct after set', function () {
        var myString = new RealTimeString("MyString", null, null, ignoreCallback);
        myString.setValue("AnotherString");
        expect(myString.value()).to.equal("AnotherString");
    });

    it('Value is correct after insert', function () {
        var myString = new RealTimeString("MyString", null, null, ignoreCallback);
        myString.insert(2, "Edited");
        expect(myString.value()).to.equal("MyEditedString");
    });

    it('Value is correct after remove', function () {
        var myString = new RealTimeString("MyString", null, null, ignoreCallback);
        myString.remove(0, 2);
        expect(myString.value()).to.equal("String");
    });

    it('Correct operation is sent after set', function () {
        lastOp = null;
        var myString = new RealTimeString("MyString", null, null, lastOpCallback);
        myString.setValue("AnotherString");

        var expectedOp = new StringSetOperation([], false, "AnotherString");
        expect(lastOp).to.deep.equal(expectedOp);
    });

    it('Correct operation is sent after insert', function () {
        lastOp = null;
        var myString = new RealTimeString("MyString", null, null, lastOpCallback);
        myString.insert(2, "Edited");

        var expectedOp = new StringInsertOperation([], false, 2, "Edited");
        expect(lastOp).to.deep.equal(expectedOp);
    });

    it('Correct operation is sent after remove', function () {
        lastOp = null;
        var myString = new RealTimeString("MyString", null, null, lastOpCallback);
        myString.remove(0, 2);

        var expectedOp = new StringRemoveOperation([], false, 0, "My");
        expect(lastOp).to.deep.equal(expectedOp);
    });

    it('Value is correct after StringSetOperation', function () {
        var myString = new RealTimeString("MyString", null, null, null);

        var incomingOp = new StringSetOperation([], false, "AnotherString");
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myString._handleIncomingOperation(incomingEvent);

        expect(myString.value()).to.equal("AnotherString");
    });

    it('Value is correct after StringInsertOperation', function () {
        var myString = new RealTimeString("MyString", null, null, null);

        var incomingOp = new StringInsertOperation([], false, 2, "Edited");
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myString._handleIncomingOperation(incomingEvent);

        expect(myString.value()).to.equal("MyEditedString");
    });

    it('Value is correct after StringRemoveOperation', function () {
        var myString = new RealTimeString("MyString", null, null, null);

        var incomingOp = new StringRemoveOperation([], false, 0, "My");
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myString._handleIncomingOperation(incomingEvent);

        expect(myString.value()).to.equal("String");
    });

    it('Correct event is fired after StringSetOperation', function () {
        lastEvent = null;
        var myString = new RealTimeString("MyString", null, null, null);
        myString.on("Set", lastEventCallback);

        var incomingOp = new StringSetOperation([], false, "AnotherString");
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myString._handleIncomingOperation(incomingEvent);

        var expectedEvent = new StringSetEvent(sessionId, username, version, timestamp, myString, "AnotherString");
        expect(lastEvent).to.deep.equal(expectedEvent);
    });

    it('Correct event is fired after StringInsertOperation', function () {
        lastEvent = null;
        var myString = new RealTimeString("MyString", null, null, null);
        myString.on("Insert", lastEventCallback);

        var incomingOp = new StringInsertOperation([], false, 2, "Edited");
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myString._handleIncomingOperation(incomingEvent);

        var expectedEvent = new StringInsertEvent(sessionId, username, version, timestamp, myString, 2, "Edited");
        expect(lastEvent).to.deep.equal(expectedEvent);
    });

    it('Correct event is fired after StringRemoveOperation', function () {
        lastEvent = null;
        var myString = new RealTimeString("MyString", null, null, null);
        myString.on("Remove", lastEventCallback);

        var incomingOp = new StringRemoveOperation([], false, 0, "My");
        var incomingEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
        myString._handleIncomingOperation(incomingEvent);

        var expectedEvent = new StringRemoveEvent(sessionId, username, version, timestamp, myString, 0, "My");
        expect(lastEvent).to.deep.equal(expectedEvent);
    });

});
