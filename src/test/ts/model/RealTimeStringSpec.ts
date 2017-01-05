import {RealTimeString} from "../../../main/ts/model/rt/RealTimeString";
import {StringSetOperation} from "../../../main/ts/model/ot/ops/StringSetOperation";
import {StringInsertOperation} from "../../../main/ts/model/ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../../../main/ts/model/ot/ops/StringRemoveOperation";
import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {ModelEventCallbacks} from "../../../main/ts/model/rt/RealTimeModel";
import {StringValue} from "../../../main/ts/model/dataValue";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {TestIdGenerator} from "./TestIdGenerator";
import {RealTimeModel} from "../../../main/ts/model/rt/RealTimeModel";
import {Model} from "../../../main/ts/model/internal/Model";
import {StringNode} from "../../../main/ts/model/internal/StringNode";
import {RealTimeWrapperFactory} from "../../../main/ts/model/rt/RealTimeWrapperFactory";
import {ModelChangedEvent} from "../../../main/ts/model/modelEvents";
import {StringSetValueEvent} from "../../../main/ts/model/modelEvents";
import {StringInsertEvent} from "../../../main/ts/model/modelEvents";
import {StringRemoveEvent} from "../../../main/ts/model/modelEvents";

import * as chai from "chai";
import * as sinon from "sinon";

const expect: any = chai.expect;

describe("RealTimeString", () => {

  const sessionId: string = "mySession";
  const username: string = "myUser";
  const version: number = 1;
  const timestamp: number = 100;

  const gen: TestIdGenerator = new TestIdGenerator();
  const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
    return gen.id();
  });

  const initialValue: StringValue =
    <StringValue> dataValueFactory.createDataValue("MyString");

  const model: Model = <Model> <any> sinon.createStubInstance(Model);
  const rtModel: RealTimeModel = <RealTimeModel> <any> sinon.createStubInstance(RealTimeModel);
  rtModel.emitLocalEvents = () => {
    return false;
  };

  let callbacks: ModelEventCallbacks;
  beforeEach(() => {
    callbacks = {
      sendOperationCallback: sinon.spy(),
      referenceEventCallbacks: {
        onShare: sinon.spy(),
        onUnshare: sinon.spy(),
        onSet: sinon.spy(),
        onClear: sinon.spy()
      }
    };
  });

  let lastEvent: ModelChangedEvent = null;
  const lastEventCallback: (event: ModelChangedEvent) => void = (event: ModelChangedEvent) => {
    lastEvent = event;
  };

  it("Value is correct after creation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    expect(myString.value()).to.equal("MyString");
  });

  it("Value is correct after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.value("AnotherString");
    expect(myString.value()).to.equal("AnotherString");
  });

  it("Value is correct after insert", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.insert(2, "Edited");
    expect(myString.value()).to.equal("MyEditedString");
  });

  it("Value is correct after remove", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.remove(0, 2);
    expect(myString.value()).to.equal("String");
  });

  it("Correct operation is sent after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.value("AnotherString");

    const expectedOp: StringSetOperation = new StringSetOperation(initialValue.id, false, "AnotherString");
    expect((<any> callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it("Correct operation is sent after insert", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.insert(2, "Edited");

    const expectedOp: StringInsertOperation = new StringInsertOperation(initialValue.id, false, 2, "Edited");
    expect((<any> callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it("Correct operation is sent after remove", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.remove(0, 2);

    const expectedOp: StringRemoveOperation = new StringRemoveOperation(initialValue.id, false, 0, "My");
    expect((<any> callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it("Value is correct after StringSetOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);

    const incomingOp: StringSetOperation = new StringSetOperation(initialValue.id, false, "AnotherString");
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myString.value()).to.equal("AnotherString");
  });

  it("Value is correct after StringInsertOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);

    const incomingOp: StringInsertOperation = new StringInsertOperation(initialValue.id, false, 2, "Edited");
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myString.value()).to.equal("MyEditedString");
  });

  it("Value is correct after StringRemoveOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);

    const incomingOp: StringRemoveOperation = new StringRemoveOperation(initialValue.id, false, 0, "My");
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myString.value()).to.equal("String");
  });

  it("Correct event is fired after StringSetOperation", () => {
    lastEvent = null;
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.on(RealTimeString.Events.VALUE, lastEventCallback);

    const incomingOp: StringSetOperation = new StringSetOperation(initialValue.id, false, "AnotherString");
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: StringSetValueEvent =
      new StringSetValueEvent(myString, sessionId, username, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it("Correct event is fired after StringInsertOperation", () => {
    lastEvent = null;
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => { return []; }, model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.on(RealTimeString.Events.INSERT, lastEventCallback);

    const incomingOp: StringInsertOperation = new StringInsertOperation(initialValue.id, false, 2, "Edited");
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: StringInsertEvent = new StringInsertEvent(myString, 2, "Edited", sessionId, username, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it("Correct event is fired after StringRemoveOperation", () => {
    lastEvent = null;
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    const delegate: StringNode = new StringNode(initialValue, () => [], model, sessionId, username);
    const myString: RealTimeString = <RealTimeString> wrapperFactory.wrap(delegate);
    myString.on("Remove", lastEventCallback);

    const incomingOp: StringRemoveOperation = new StringRemoveOperation(initialValue.id, false, 0, "My");
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: StringRemoveEvent = new StringRemoveEvent(myString, 0, "My", sessionId, username, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });
});
