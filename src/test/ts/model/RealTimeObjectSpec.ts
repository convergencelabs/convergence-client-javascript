import ModelOperationEvent from "../../../main/ts/model/ModelOperationEvent";
import RealTimeObject from "../../../main/ts/model/RealTimeObject";
import ObjectSetOperation from "../../../main/ts/model/ot/ops/ObjectSetOperation";
import {ObjectSetValueEvent} from "../../../main/ts/model/RealTimeObject";
import {ModelEventCallbacks} from "../../../main/ts/model/RealTimeModel";
import {ObjectValue} from "../../../main/ts/connection/protocol/model/dataValue";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {TestIdGenerator} from "./TestIdGenerator";
import {DataValue} from "../../../main/ts/connection/protocol/model/dataValue";

import * as chai from "chai";
import * as sinon from "sinon";
import SinonSpy = Sinon.SinonSpy;

var expect: any = chai.expect;

describe('RealTimeObject', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var callbacks: ModelEventCallbacks;

  var idGenerator: () => string = new TestIdGenerator().id;
  var initialValue: ObjectValue =
    <ObjectValue>DataValueFactory.createDataValue(true, idGenerator);

  var setValue: {[key: string]: DataValue} = {
    string: DataValueFactory.createDataValue("test", idGenerator)
  };

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

  it('Value is correct after creation', () => {
    var myObject: RealTimeObject = new RealTimeObject(initialValue, null, null, null, null);
    expect(myObject.value()).to.deep.equal({"num": 5});
  });

  it('Value is correct after set', () => {
    var myObject: RealTimeObject = new RealTimeObject(initialValue, null, null, callbacks, null);
    myObject.value({"string": "test"});
    expect(myObject.value()).to.deep.equal({"string": "test"});
  });

  it('Value is correct after setProperty', () => {
    var myObject: RealTimeObject = new RealTimeObject(initialValue, null, null, callbacks, null);
    myObject.set("num", 10);
    expect(myObject.get("num").value()).to.deep.equal(10);
  });

  it('Correct operation is sent after set', () => {
    var myObject: RealTimeObject = new RealTimeObject(initialValue, null, null, callbacks, null);
    myObject.value({string: "test"});

    var expectedOp: ObjectSetOperation = new ObjectSetOperation(initialValue.id, false, setValue);
    expect((<any>callbacks.sendOperationCallback).lastCall.args[0]).to.be.deep.equal(expectedOp);
  });

  it('Value is correct after ObjectSetOperation', () => {
    var myObject: RealTimeObject = new RealTimeObject(initialValue, null, null, null, null);

    var incomingOp: ObjectSetOperation = new ObjectSetOperation(initialValue.id, false, setValue);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myObject._handleRemoteOperation(incomingEvent);

    expect(myObject.value()).to.deep.equal({"string": "test"});
  });

  it('Correct Event is fired after ObjectSetOperation', () => {
    var eventCallback: SinonSpy = sinon.spy();
    var myObject: RealTimeObject = new RealTimeObject(initialValue, null, null, null, null);
    myObject.on(RealTimeObject.Events.VALUE, eventCallback);

    var incomingOp: ObjectSetOperation = new ObjectSetOperation(initialValue.id, false, setValue);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myObject._handleRemoteOperation(incomingEvent);

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
