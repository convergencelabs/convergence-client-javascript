import RealTimeBoolean from "../../../main/ts/model/RealTimeBoolean";
import ModelOperationEvent from "../../../main/ts/model/ModelOperationEvent";
import BooleanSetOperation from "../../../main/ts/model/ot/ops/BooleanSetOperation";
import {BooleanSetValueEvent} from "../../../main/ts/model/RealTimeBoolean";
import {ModelChangeEvent} from "../../../main/ts/model/events";
import {ModelEventCallbacks} from "../../../main/ts/model/RealTimeModel";

import * as chai from "chai";
import * as sinon from "sinon";


var expect: any = chai.expect;

describe('RealTimeBoolean', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var callbacks: ModelEventCallbacks;

  beforeEach(function (): void {
    callbacks = {
      sendOperationCallback: sinon.spy(),
      referenceEventCallbacks: {
        onPublish: sinon.spy(),
        onUnpublish: sinon.spy(),
        onSet: sinon.spy(),
        onClear: sinon.spy(),
      }
    };
  });

  var lastEvent: ModelChangeEvent = null;
  var lastEventCallback: (event: ModelChangeEvent) => void = (event: ModelChangeEvent) => {
    lastEvent = event;
  };

  it('Value is correct after creation', () => {
    var myBoolean: RealTimeBoolean = new RealTimeBoolean(true, null, null, null, null);
    expect(myBoolean.value()).to.equal(true);
  });

  it('Value is correct after set', () => {
    var myBoolean: RealTimeBoolean = new RealTimeBoolean(true, null, null, callbacks, null);
    myBoolean.value(false);
    expect(myBoolean.value()).to.equal(false);
  });

  it('Correct operation is sent after set', () => {
    var myBoolean: RealTimeBoolean = new RealTimeBoolean(true, null, null, callbacks, null);
    myBoolean.value(false);

    var expectedOp: BooleanSetOperation = new BooleanSetOperation([], false, false);
    expect((<any>callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it('Value is correct after BooleanSetOperation', () => {
    var myBoolean: RealTimeBoolean = new RealTimeBoolean(true, null, null, null, null);

    var incomingOp: BooleanSetOperation = new BooleanSetOperation([], false, false);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myBoolean._handleRemoteOperation(incomingOp.path, incomingEvent);

    expect(myBoolean.value()).to.equal(false);
  });

  it('Correct Event is fired after BooleanSetOperation', () => {
    lastEvent = null;
    var myBoolean: RealTimeBoolean = new RealTimeBoolean(true, null, null, null, null);
    myBoolean.on(RealTimeBoolean.Events.VALUE, lastEventCallback);

    var incomingOp: BooleanSetOperation = new BooleanSetOperation([], false, false);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myBoolean._handleRemoteOperation(incomingOp.path, incomingEvent);

    var expectedEvent: BooleanSetValueEvent = {
      src: myBoolean,
      name: RealTimeBoolean.Events.VALUE,
      sessionId: sessionId,
      userId: username,
      version: version,
      timestamp: timestamp,
      value: false
    };
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

});
