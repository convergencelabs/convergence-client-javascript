import ModelOperationEvent from "../../../main/ts/model/ModelOperationEvent";
import RealTimeObject from "../../../main/ts/model/RealTimeObject";
import ObjectSetOperation from "../../../main/ts/model/ot/ops/ObjectSetOperation";
import {ObjectSetValueEvent} from "../../../main/ts/model/RealTimeObject";

import * as chai from "chai";
import * as sinon from "sinon";
import SinonSpy = Sinon.SinonSpy;
import {ModelEventCallbacks} from "../../../main/ts/model/RealTimeModel";

var expect: any = chai.expect;

describe('RealTimeObject', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var callbacks: ModelEventCallbacks;

  beforeEach(function(): void {
    callbacks = {
      onOutgoingOperation: sinon.spy(),
      onOutgoingReferenceEvent: sinon.spy()
    };
  });

  it('Value is correct after creation', () => {
    var myObject: RealTimeObject = new RealTimeObject({"num": 5}, null, null, null, null);
    expect(myObject.value()).to.deep.equal({"num": 5});
  });

  it('Value is correct after set', () => {
    var myObject: RealTimeObject = new RealTimeObject({"num": 5}, null, null, callbacks, null);
    myObject.value({"string": "test"});
    expect(myObject.value()).to.deep.equal({"string": "test"});
  });

  it('Value is correct after setProperty', () => {
    var myObject: RealTimeObject = new RealTimeObject({"num": 5}, null, null, callbacks, null);
    myObject.set("num", 10);
    expect(myObject.get("num").value()).to.deep.equal(10);
  });

  it('Correct operation is sent after set', () => {
    var myObject: RealTimeObject = new RealTimeObject({num: 5}, null, null, callbacks, null);
    myObject.value({string: "test"});

    var expectedOp: ObjectSetOperation = new ObjectSetOperation([], false, {string: "test"});
    expect((<any>callbacks.onOutgoingOperation).lastCall.args[0]).to.be.deep.equal(expectedOp);
  });

  it('Value is correct after ObjectSetOperation', () => {
    var myObject: RealTimeObject = new RealTimeObject({"num": 5}, null, null, null, null);

    var incomingOp: ObjectSetOperation = new ObjectSetOperation([], false, {"string": "test"});
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myObject._handleRemoteOperation(incomingOp.path, incomingEvent);

    expect(myObject.value()).to.deep.equal({"string": "test"});
  });

  it('Correct Event is fired after ObjectSetOperation', () => {
    var eventCallback: SinonSpy = sinon.spy();
    var myObject: RealTimeObject = new RealTimeObject({"num": 5}, null, null, null, null);
    myObject.on(RealTimeObject.Events.VALUE, eventCallback);

    var incomingOp: ObjectSetOperation = new ObjectSetOperation([], false, {"string": "test"});
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myObject._handleRemoteOperation(incomingOp.path, incomingEvent);

    var expectedEvent: ObjectSetValueEvent = {
      src: myObject,
      name: RealTimeObject.Events.VALUE,
      sessionId: sessionId,
      userId: username,
      version: version,
      timestamp: timestamp,
      value: {"string": "test"}
    };
    expect(eventCallback.lastCall.args[0]).to.deep.equal(expectedEvent);
  });
});
