import RealTimeString from "../../../main/ts/model/RealTimeString";
import {StringSetOperation} from "../../../main/ts/model/ot/ops/StringSetOperation";
import {StringInsertOperation} from "../../../main/ts/model/ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../../../main/ts/model/ot/ops/StringRemoveOperation";
import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {StringRemoveEvent} from "../../../main/ts/model/RealTimeString";
import {StringInsertEvent} from "../../../main/ts/model/RealTimeString";
import {StringSetValueEvent} from "../../../main/ts/model/RealTimeString";
import {ModelChangeEvent} from "../../../main/ts/model/events";
import {ModelEventCallbacks} from "../../../main/ts/model/RealTimeModel";

import * as chai from "chai";
import * as sinon from "sinon";
import {StringValue} from "../../../main/ts/model/dataValue";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {TestIdGenerator} from "./TestIdGenerator";
import {RealTimeModel} from "../../../main/ts/model/RealTimeModel";

var expect: any = chai.expect;

describe('RealTimeString', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var callbacks: ModelEventCallbacks;

  var gen: TestIdGenerator = new TestIdGenerator();
  var idGenerator: () => string = () => {
    return gen.id();
  };

  var initialValue: StringValue =
    <StringValue>DataValueFactory.createDataValue("MyString", idGenerator);

  var model: RealTimeModel = <RealTimeModel><any>sinon.createStubInstance(RealTimeModel);

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

  var lastEvent: ModelChangeEvent = null;
  var lastEventCallback: (event: ModelChangeEvent) => void = (event: ModelChangeEvent) => {
    lastEvent = event;
  };

  it('Value is correct after creation', () => {
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, callbacks, model);
    expect(myString.value()).to.equal("MyString");
  });

  it('Value is correct after set', () => {
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, callbacks, model);
    myString.value("AnotherString");
    expect(myString.value()).to.equal("AnotherString");
  });

  it('Value is correct after insert', () => {
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, callbacks, model);
    myString.insert(2, "Edited");
    expect(myString.value()).to.equal("MyEditedString");
  });

  it('Value is correct after remove', () => {
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, callbacks, model);
    myString.remove(0, 2);
    expect(myString.value()).to.equal("String");
  });

  it('Correct operation is sent after set', () => {
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, callbacks, model);
    myString.value("AnotherString");

    var expectedOp: StringSetOperation = new StringSetOperation(initialValue.id, false, "AnotherString");
    expect((<any>callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after insert', () => {
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, callbacks, model);
    myString.insert(2, "Edited");

    var expectedOp: StringInsertOperation = new StringInsertOperation(initialValue.id, false, 2, "Edited");
    expect((<any>callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after remove', () => {
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, callbacks, model);
    myString.remove(0, 2);

    var expectedOp: StringRemoveOperation = new StringRemoveOperation(initialValue.id, false, 0, "My");
    expect((<any>callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it('Value is correct after StringSetOperation', () => {
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, null, model);

    var incomingOp: StringSetOperation = new StringSetOperation(initialValue.id, false, "AnotherString");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingEvent);

    expect(myString.value()).to.equal("AnotherString");
  });

  it('Value is correct after StringInsertOperation', () => {
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, null, model);

    var incomingOp: StringInsertOperation = new StringInsertOperation(initialValue.id, false, 2, "Edited");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingEvent);

    expect(myString.value()).to.equal("MyEditedString");
  });

  it('Value is correct after StringRemoveOperation', () => {
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, null, model);

    var incomingOp: StringRemoveOperation = new StringRemoveOperation(initialValue.id, false, 0, "My");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingEvent);

    expect(myString.value()).to.equal("String");
  });

  it('Correct event is fired after StringSetOperation', () => {
    lastEvent = null;
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, null, model);
    myString.on(RealTimeString.Events.VALUE, lastEventCallback);

    var incomingOp: StringSetOperation = new StringSetOperation(initialValue.id, false, "AnotherString");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingEvent);

    var expectedEvent: StringSetValueEvent = {
      src: myString,
      name: RealTimeString.Events.VALUE,
      sessionId: sessionId,
      userId: username,
      version: version,
      timestamp: timestamp,
      value: "AnotherString"
    };
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after StringInsertOperation', () => {
    lastEvent = null;
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, null, model);
    myString.on(RealTimeString.Events.INSERT, lastEventCallback);

    var incomingOp: StringInsertOperation = new StringInsertOperation(initialValue.id, false, 2, "Edited");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingEvent);

    var expectedEvent: StringInsertEvent = {
      src: myString,
      name: RealTimeString.Events.INSERT,
      sessionId: sessionId,
      userId: username,
      version: version,
      timestamp: timestamp,
      index: 2,
      value: "Edited"
    };
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after StringRemoveOperation', () => {
    lastEvent = null;
    var myString: RealTimeString = new RealTimeString(initialValue, null, null, null, model);
    myString.on("Remove", lastEventCallback);

    var incomingOp: StringRemoveOperation = new StringRemoveOperation(initialValue.id, false, 0, "My");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingEvent);

    var expectedEvent: StringRemoveEvent = {
      src: myString,
      name: RealTimeString.Events.REMOVE,
      sessionId: sessionId,
      userId: username,
      version: version,
      timestamp: timestamp,
      index: 0,
      value: "My"
    };

    expect(lastEvent).to.deep.equal(expectedEvent);
  });

});
