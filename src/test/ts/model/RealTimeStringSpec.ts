import {RealTimeString} from "../../../main/ts/model/rt/RealTimeString";
import {StringSetOperation} from "../../../main/ts/model/ot/ops/StringSetOperation";
import {StringInsertOperation} from "../../../main/ts/model/ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../../../main/ts/model/ot/ops/StringRemoveOperation";
import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {ModelEventCallbacks} from "../../../main/ts/model/rt/RealTimeModel";

import * as chai from "chai";
import * as sinon from "sinon";
import {StringValue} from "../../../main/ts/model/dataValue";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {TestIdGenerator} from "./TestIdGenerator";
import {RealTimeModel} from "../../../main/ts/model/rt/RealTimeModel";
import {Model} from "../../../main/ts/model/internal/Model";
import {StringNode} from "../../../main/ts/model/internal/StringNode";
import {RealTimeWrapperFactory} from "../../../main/ts/model/rt/RealTimeWrapperFactory";
import {ModelChangedEvent} from "../../../main/ts/model/rt/events";
import {StringSetValueEvent} from "../../../main/ts/model/rt/events";
import {StringInsertEvent} from "../../../main/ts/model/rt/events";
import {StringRemoveEvent} from "../../../main/ts/model/rt/events";

var expect: any = chai.expect;

describe('RealTimeString', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var callbacks: ModelEventCallbacks;

  var gen: TestIdGenerator = new TestIdGenerator();

  var dataValueFactory: DataValueFactory = new DataValueFactory(() => {
    return gen.id();
  });

  var initialValue: StringValue =
    <StringValue>dataValueFactory.createDataValue("MyString");

  var model: Model = <Model><any>sinon.createStubInstance(Model);
  var rtModel: RealTimeModel = <RealTimeModel><any>sinon.createStubInstance(RealTimeModel);
  rtModel.emitLocalEvents = () => {
    return false;
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

  var lastEvent: ModelChangedEvent = null;
  var lastEventCallback: (event: ModelChangedEvent) => void = (event: ModelChangedEvent) => {
    lastEvent = event;
  };

  it('Value is correct after creation', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    expect(myString.data()).to.equal("MyString");
  });

  it('Value is correct after set', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.data("AnotherString");
    expect(myString.data()).to.equal("AnotherString");
  });

  it('Value is correct after insert', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.insert(2, "Edited");
    expect(myString.data()).to.equal("MyEditedString");
  });

  it('Value is correct after remove', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.remove(0, 2);
    expect(myString.data()).to.equal("String");
  });

  it('Correct operation is sent after set', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.data("AnotherString");

    var expectedOp: StringSetOperation = new StringSetOperation(initialValue.id, false, "AnotherString");
    expect((<any>callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after insert', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.insert(2, "Edited");

    var expectedOp: StringInsertOperation = new StringInsertOperation(initialValue.id, false, 2, "Edited");
    expect((<any>callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after remove', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.remove(0, 2);

    var expectedOp: StringRemoveOperation = new StringRemoveOperation(initialValue.id, false, 0, "My");
    expect((<any>callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it('Value is correct after StringSetOperation', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);

    var incomingOp: StringSetOperation = new StringSetOperation(initialValue.id, false, "AnotherString");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myString.data()).to.equal("AnotherString");
  });

  it('Value is correct after StringInsertOperation', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);

    var incomingOp: StringInsertOperation = new StringInsertOperation(initialValue.id, false, 2, "Edited");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myString.data()).to.equal("MyEditedString");
  });

  it('Value is correct after StringRemoveOperation', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);

    var incomingOp: StringRemoveOperation = new StringRemoveOperation(initialValue.id, false, 0, "My");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myString.data()).to.equal("String");
  });

  it('Correct event is fired after StringSetOperation', () => {
    lastEvent = null;
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.on(RealTimeString.Events.VALUE, lastEventCallback);

    var incomingOp: StringSetOperation = new StringSetOperation(initialValue.id, false, "AnotherString");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    var expectedEvent: StringSetValueEvent = new StringSetValueEvent(myString, "AnotherString", sessionId, username, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after StringInsertOperation', () => {
    lastEvent = null;
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.on(RealTimeString.Events.INSERT, lastEventCallback);

    var incomingOp: StringInsertOperation = new StringInsertOperation(initialValue.id, false, 2, "Edited");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    var expectedEvent: StringInsertEvent = new StringInsertEvent(myString, 2, "Edited", sessionId, username, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after StringRemoveOperation', () => {
    lastEvent = null;
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: StringNode = new StringNode(initialValue, () => {return [];}, model, sessionId, username);
    var myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.on("Remove", lastEventCallback);

    var incomingOp: StringRemoveOperation = new StringRemoveOperation(initialValue.id, false, 0, "My");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    var expectedEvent: StringRemoveEvent = new StringRemoveEvent(myString, 0, "My", sessionId, username, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

});
