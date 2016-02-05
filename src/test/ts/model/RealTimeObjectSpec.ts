import ModelChangeEvent from "../../../main/ts/model/events/ModelChangeEvent";
import ModelOperationEvent from "../../../main/ts/model/ModelOperationEvent";
import RealTimeObject from "../../../main/ts/model/RealTimeObject";
import ObjectSetOperation from "../../../main/ts/ot/ops/ObjectSetOperation";
import ObjectSetEvent from "../../../main/ts/model/events/ObjectSetEvent";

import * as chai from "chai";
import * as sinon from "sinon";
import SinonSpy = Sinon.SinonSpy;

var expect: any = chai.expect;

describe('RealTimeObject', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  it('Value is correct after creation', () => {
    var myObject: RealTimeObject = new RealTimeObject({"num": 5}, null, null, null);
    expect(myObject.value()).to.deep.equal({"num": 5});
  });

  it('Value is correct after set', () => {
    var myObject: RealTimeObject = new RealTimeObject({"num": 5}, null, null, sinon.spy());
    myObject.setValue({"string": "test"});
    expect(myObject.value()).to.deep.equal({"string": "test"});
  });

  it('Value is correct after setProperty', () => {
    var myObject: RealTimeObject = new RealTimeObject({"num": 5}, null, null, sinon.spy());
    myObject.setProperty("num", 10);
    expect(myObject.getProperty("num").value()).to.deep.equal(10);
  });

  it('Correct operation is sent after set', () => {

    var sendOpCallback: SinonSpy = sinon.spy();
    var myObject: RealTimeObject = new RealTimeObject({num: 5}, null, null, sendOpCallback);
    myObject.setValue({string: "test"});

    var expectedOp: ObjectSetOperation = new ObjectSetOperation([], false, {string: "test"});
    expect(sendOpCallback.lastCall.args[0]).to.be.deep.equal(expectedOp);
  });

  it('Value is correct after ObjectSetOperation', () => {
    var myObject: RealTimeObject = new RealTimeObject({"num": 5}, null, null, null);

    var incomingOp: ObjectSetOperation = new ObjectSetOperation([], false, {"string": "test"});
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myObject._handleIncomingOperation(incomingEvent);

    expect(myObject.value()).to.deep.equal({"string": "test"});
  });

  it('Correct Event is fired after ObjectSetOperation', () => {
    var eventCallback: SinonSpy = sinon.spy();
    var myObject: RealTimeObject = new RealTimeObject({"num": 5}, null, null, null);
    myObject.on("Set", eventCallback);

    var incomingOp: ObjectSetOperation = new ObjectSetOperation([], false, {"string": "test"});
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myObject._handleIncomingOperation(incomingEvent);

    var expectedEvent: ObjectSetEvent = new ObjectSetEvent(sessionId, username, version, timestamp, myObject, {"string": "test"});
    expect(eventCallback.lastCall.args[0]).to.deep.equal(expectedEvent);
  });

});
