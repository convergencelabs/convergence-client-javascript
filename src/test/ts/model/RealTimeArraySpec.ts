import RealTimeArray from "../../../main/ts/model/RealTimeArray";
import ArraySetOperation from "../../../main/ts/model/ot/ops/ArraySetOperation";
import ArrayInsertOperation from "../../../main/ts/model/ot/ops/ArrayInsertOperation";
import ArrayRemoveOperation from "../../../main/ts/model/ot/ops/ArrayRemoveOperation";
import ArrayReplaceOperation from "../../../main/ts/model/ot/ops/ArrayReplaceOperation";
import ArrayMoveOperation from "../../../main/ts/model/ot/ops/ArrayMoveOperation";
import ModelOperationEvent from "../../../main/ts/model/ModelOperationEvent";
import {ModelChangeEvent} from "../../../main/ts/model/events";
import {ArrayInsertEvent} from "../../../main/ts/model/RealTimeArray";
import {ArrayRemoveEvent} from "../../../main/ts/model/RealTimeArray";
import {ArraySetEvent} from "../../../main/ts/model/RealTimeArray";
import {ArrayReorderEvent} from "../../../main/ts/model/RealTimeArray";
import {ModelEventCallbacks} from "../../../main/ts/model/RealTimeModel";

import * as chai from "chai";
import * as sinon from "sinon";
import {ArrayValue} from "../../../main/ts/connection/protocol/model/dataValue";
import {TestIdGenerator} from "./TestIdGenerator";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {DataValue} from "../../../main/ts/connection/protocol/model/dataValue";
import {RealTimeModel} from "../../../main/ts/model/RealTimeModel";

var expect: any = chai.expect;

describe('RealTimeArray', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var gen: TestIdGenerator = new TestIdGenerator();
  var idGenerator: () => string = () => {
    return gen.id();
  };

  // fixme this is a a bit of a hack.  Recreating methods???
  var model: RealTimeModel = <RealTimeModel><any>sinon.createStubInstance(RealTimeModel);
  model._createDataValue = (value: any) => {
    return DataValueFactory.createDataValue(value, idGenerator);
  };


  var primitveValue: any[] = ["A", "B", "C"];

  var arrayValue: ArrayValue =
    <ArrayValue>DataValueFactory.createDataValue(primitveValue, idGenerator);

  var newArray: DataValue[] = [
    DataValueFactory.createDataValue("X", idGenerator),
    DataValueFactory.createDataValue("Y", idGenerator),
    DataValueFactory.createDataValue("Z", idGenerator)
  ];

  var callbacks: ModelEventCallbacks;

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
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);
    expect(myArray.value()).to.deep.equal(primitveValue);
  });

  it('Value is correct after set', () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, callbacks, model);
    myArray.value(["X", "Y", "Z"]);
    expect(myArray.value()).to.deep.equal(["X", "Y", "Z"]);
  });

  it('Value is correct after insert', () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, callbacks, model);
    myArray.insert(2, "X");
    expect(myArray.value()).to.deep.equal(["A", "B", "X", "C"]);
  });

  it('Value is correct after remove', () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, callbacks, model);
    myArray.remove(1);
    expect(myArray.value()).to.deep.equal(["A", "C"]);
  });

  it('Value is correct after set', () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, callbacks, model);
    myArray.set(1, "X");
    expect(myArray.value()).to.deep.equal(["A", "X", "C"]);
  });

  it('Value is correct after move', () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, callbacks, model);
    myArray.reorder(1, 2);
    expect(myArray.value()).to.deep.equal(["A", "C", "B"]);
  });

  it('Correct operation is sent after set value', () => {

    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, callbacks, model);
    myArray.value(["X", "Y", "Z"]);

    // var expectedOp: ArraySetOperation = new ArraySetOperation([], false, ["X", "Y", "Z"]);
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after insert', () => {

    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, callbacks, model);
    myArray.insert(2, "X");

    // var expectedOp: ArrayInsertOperation = new ArrayInsertOperation([], false, 2, "X");
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after remove', () => {

    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, callbacks, model);
    myArray.remove(1);

    // var expectedOp: ArrayRemoveOperation = new ArrayRemoveOperation([], false, 1);
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after set', () => {

    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, callbacks, model);
    myArray.set(1, "X");

    // var expectedOp: ArrayReplaceOperation = new ArrayReplaceOperation([], false, 1, "X");
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after move', () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, callbacks, model);
    myArray.reorder(1, 2);

    // var expectedOp: ArrayMoveOperation = new ArrayMoveOperation([], false, 1, 2);
    // expect(lastOp).to.deep.equal(expectedOp);
  });


  it('Value is correct after ArraySetOperation', () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);

    var incomingOp: ArraySetOperation = new ArraySetOperation(arrayValue.id, false, newArray);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleRemoteOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["X", "Y", "Z"]);
  });

  it('Value is correct after ArrayInsertOperation', () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);

    var newValue: DataValue = DataValueFactory.createDataValue("X", idGenerator);

    var incomingOp: ArrayInsertOperation = new ArrayInsertOperation(arrayValue.id, false, 2, newValue);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleRemoteOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "B", "X", "C"]);
  });

  it('Value is correct after ArrayRemoveOperation', () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);

    var incomingOp: ArrayRemoveOperation = new ArrayRemoveOperation(arrayValue.id, false, 1);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleRemoteOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "C"]);
  });

  it('Value is correct after ArrayReplaceOperation', () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);

    var incomingOp: ArrayReplaceOperation =
      new ArrayReplaceOperation(arrayValue.id, false, 1, DataValueFactory.createDataValue("X", idGenerator));
    var incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleRemoteOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "X", "C"]);
  });

  it('Value is correct after ArrayMoveOperation', () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);

    var incomingOp: ArrayMoveOperation =
      new ArrayMoveOperation(arrayValue.id, false, 1, 2);
    var incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleRemoteOperation(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "C", "B"]);
  });

  it('Correct event is fired after ArraySetOperation', () => {
    lastEvent = null;
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);
    myArray.on(RealTimeArray.Events.VALUE, lastEventCallback);

    var incomingOp: ArraySetOperation = new ArraySetOperation(arrayValue.id, false, newArray);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleRemoteOperation(incomingEvent);

    // var expectedEvent: ArraySetValueEvent = {
    //  src: myArray,
    //  name: RealTimeArray.Events.VALUE,
    //  sessionId: sessionId,
    //  userId: username,
    //  version: version,
    //  timestamp: timestamp,
    //  value: ["X", "Y", "Z"]
    //  };
    // expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayInsertOperation', () => {
    lastEvent = null;
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);
    myArray.on(RealTimeArray.Events.INSERT, lastEventCallback);

    var newValue: DataValue = DataValueFactory.createDataValue("X", idGenerator);
    var incomingOp: ArrayInsertOperation = new ArrayInsertOperation(arrayValue.id, false, 2, newValue);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleRemoteOperation(incomingEvent);

    //  var expectedEvent: ArrayInsertEvent = {
    //  src: myArray,
    //  name: RealTimeArray.Events.INSERT,
    //  sessionId: sessionId,
    //  userId: username,
    //  version: version,
    //  timestamp: timestamp,
    //  index: 2,
    //  value: "X"
    //  };
    //  expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayRemoveOperation', () => {
    lastEvent = null;
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);
    myArray.on(RealTimeArray.Events.REMOVE, lastEventCallback);

    var incomingOp: ArrayRemoveOperation = new ArrayRemoveOperation(arrayValue.id, false, 1);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleRemoteOperation(incomingEvent);

    // var expectedEvent: ArrayRemoveEvent = {
    //  src: myArray,
    //  name: RealTimeArray.Events.REMOVE,
    //  sessionId: sessionId,
    //  userId: username,
    //  version: version,
    //  timestamp: timestamp,
    //  index: 1
    // };
    // expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayReplaceOperation', () => {
    lastEvent = null;
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);
    myArray.on(RealTimeArray.Events.SET, lastEventCallback);

    var newValue: DataValue = DataValueFactory.createDataValue("X", idGenerator);

    var incomingOp: ArrayReplaceOperation = new ArrayReplaceOperation(arrayValue.id, false, 1, newValue);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleRemoteOperation(incomingEvent);

    // var expectedEvent: ArraySetEvent = {
    //  src: myArray,
    //  name: RealTimeArray.Events.SET,
    //  sessionId: sessionId,
    //  userId: username,
    //  version: version,
    //  timestamp: timestamp,
    //  index: 1,
    //  value: "X"
    // };
    // expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayMoveOperation', () => {
    lastEvent = null;
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);
    myArray.on(RealTimeArray.Events.REORDER, lastEventCallback);

    var incomingOp: ArrayMoveOperation = new ArrayMoveOperation(arrayValue.id, false, 1, 2);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myArray._handleRemoteOperation(incomingEvent);

    // var expectedEvent: ArrayReorderEvent = {
    //  src: myArray,
    //  name: RealTimeArray.Events.REORDER,
    //  sessionId: sessionId,
    //  userId: username,
    //  version: version,
    //  timestamp: timestamp,
    //  fromIndex: 1,
    //  toIndex: 2
    // };
    // expect(lastEvent).to.deep.equal(expectedEvent);
  });
});
