import {RealTimeArray} from "../../../main/ts/model/rt/RealTimeArray";
import {ArraySetOperation} from "../../../main/ts/model/ot/ops/ArraySetOperation";
import {ArrayInsertOperation} from "../../../main/ts/model/ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../../../main/ts/model/ot/ops/ArrayRemoveOperation";
import {ArrayReplaceOperation} from "../../../main/ts/model/ot/ops/ArrayReplaceOperation";
import {ArrayMoveOperation} from "../../../main/ts/model/ot/ops/ArrayMoveOperation";
import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {ModelEventCallbacks} from "../../../main/ts/model/rt/RealTimeModel";

import * as chai from "chai";
import * as sinon from "sinon";

import {TestIdGenerator} from "./TestIdGenerator";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {DataValue} from "../../../main/ts/model/dataValue";
import {RealTimeModel} from "../../../main/ts/model/rt/RealTimeModel";
import {ArrayValue} from "../../../main/ts/model/dataValue";
import {Model} from "../../../main/ts/model/internal/Model";
import {ArrayNode} from "../../../main/ts/model/internal/ArrayNode";
import {RealTimeWrapperFactory} from "../../../main/ts/model/rt/RealTimeWrapperFactory";
import {ArraySetValueEvent} from "../../../main/ts/model/rt/events";
import {ArrayInsertEvent} from "../../../main/ts/model/rt/events";
import {ArrayRemoveEvent} from "../../../main/ts/model/rt/events";
import {ArraySetEvent} from "../../../main/ts/model/rt/events";
import {ArrayReorderEvent} from "../../../main/ts/model/rt/events";

var expect: any = chai.expect;

describe('RealTimeArray', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var gen: TestIdGenerator = new TestIdGenerator();

  var dataValueFactory: DataValueFactory = new DataValueFactory(() => {
    return gen.id();
  });

  var model: Model = <Model><any>sinon.createStubInstance(Model);

  var primitveValue: any[] = ["A", "B", "C"];

  var arrayValue: ArrayValue = <ArrayValue>dataValueFactory.createDataValue(primitveValue);

  var newArray: DataValue[] = [
    dataValueFactory.createDataValue("X"),
    dataValueFactory.createDataValue("Y"),
    dataValueFactory.createDataValue("Z")
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



  var lastEvent: any = null;
  var lastEventCallback: (event: any) => void = (event: any) => {
    lastEvent = event;
  };

  it('Value is correct after creation', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    expect(myArray.data()).to.deep.equal(primitveValue);
  });

  it('Value is correct after set', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.data(["X", "Y", "Z"]);
    expect(myArray.data()).to.deep.equal(["X", "Y", "Z"]);
  });

  it('Value is correct after insert', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.insert(2, "X");
    expect(myArray.data()).to.deep.equal(["A", "B", "X", "C"]);
  });

  it('Value is correct after remove', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.remove(1);
    expect(myArray.data()).to.deep.equal(["A", "C"]);
  });

  it('Value is correct after set', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.set(1, "X");
    expect(myArray.data()).to.deep.equal(["A", "X", "C"]);
  });

  it('Value is correct after move', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.reorder(1, 2);
    expect(myArray.data()).to.deep.equal(["A", "C", "B"]);
  });

  it('Correct operation is sent after set value', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.data(["X", "Y", "Z"]);

    // var expectedOp: ArraySetOperation = new ArraySetOperation([], false, ["X", "Y", "Z"]);
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after insert', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.insert(2, "X");

    // var expectedOp: ArrayInsertOperation = new ArrayInsertOperation([], false, 2, "X");
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after remove', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.remove(1);

    // var expectedOp: ArrayRemoveOperation = new ArrayRemoveOperation([], false, 1);
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after set', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.set(1, "X");

    // var expectedOp: ArrayReplaceOperation = new ArrayReplaceOperation([], false, 1, "X");
    // expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after move', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.reorder(1, 2);

    // var expectedOp: ArrayMoveOperation = new ArrayMoveOperation([], false, 1, 2);
    // expect(lastOp).to.deep.equal(expectedOp);
  });


  it('Value is correct after ArraySetOperation', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);

    var incomingOp: ArraySetOperation = new ArraySetOperation(arrayValue.id, false, newArray);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myArray.data()).to.deep.equal(["X", "Y", "Z"]);
  });

  it('Value is correct after ArrayInsertOperation', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);

    var newValue: DataValue = dataValueFactory.createDataValue("X");

    var incomingOp: ArrayInsertOperation = new ArrayInsertOperation(arrayValue.id, false, 2, newValue);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myArray.data()).to.deep.equal(["A", "B", "X", "C"]);
  });

  it('Value is correct after ArrayRemoveOperation', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);

    var incomingOp: ArrayRemoveOperation = new ArrayRemoveOperation(arrayValue.id, false, 1);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myArray.data()).to.deep.equal(["A", "C"]);
  });

  it('Value is correct after ArrayReplaceOperation', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);

    var incomingOp: ArrayReplaceOperation =
      new ArrayReplaceOperation(arrayValue.id, false, 1, dataValueFactory.createDataValue("X"));
    var incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myArray.data()).to.deep.equal(["A", "X", "C"]);
  });

  it('Value is correct after ArrayMoveOperation', () => {
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);

    var incomingOp: ArrayMoveOperation =
      new ArrayMoveOperation(arrayValue.id, false, 1, 2);
    var incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myArray.data()).to.deep.equal(["A", "C", "B"]);
  });

  it('Correct event is fired after ArraySetOperation', () => {
    lastEvent = null;
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.on(RealTimeArray.Events.VALUE, lastEventCallback);

    var incomingOp: ArraySetOperation = new ArraySetOperation(arrayValue.id, false, newArray);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

     var expectedEvent: ArraySetValueEvent = new ArraySetValueEvent(myArray, ["X", "Y", "Z"], sessionId, username);
     expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayInsertOperation', () => {
    lastEvent = null;
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.on(RealTimeArray.Events.INSERT, lastEventCallback);

    var newValue: DataValue = dataValueFactory.createDataValue("X");
    var incomingOp: ArrayInsertOperation = new ArrayInsertOperation(arrayValue.id, false, 2, newValue);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    var expectedEvent: ArrayInsertEvent = new ArrayInsertEvent(myArray, 2, myArray.get(2), sessionId, username);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayRemoveOperation', () => {
    lastEvent = null;
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.on(RealTimeArray.Events.REMOVE, lastEventCallback);

    var incomingOp: ArrayRemoveOperation = new ArrayRemoveOperation(arrayValue.id, false, 1);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    var expectedEvent: ArrayRemoveEvent = new ArrayRemoveEvent(myArray, 1, sessionId, username);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayReplaceOperation', () => {
    lastEvent = null;
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.on(RealTimeArray.Events.SET, lastEventCallback);

    var newValue: DataValue = dataValueFactory.createDataValue("X");

    var incomingOp: ArrayReplaceOperation = new ArrayReplaceOperation(arrayValue.id, false, 1, newValue);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

     var expectedEvent: ArraySetEvent = new ArraySetEvent(myArray, 1, "X", sessionId, username);
     expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it('Correct event is fired after ArrayMoveOperation', () => {
    lastEvent = null;
    var wrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: ArrayNode = new ArrayNode(arrayValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myArray: RealTimeArray = <RealTimeArray> wrapperFactory.wrap(delegate);
    myArray.on(RealTimeArray.Events.REORDER, lastEventCallback);

    var incomingOp: ArrayMoveOperation = new ArrayMoveOperation(arrayValue.id, false, 1, 2);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    var expectedEvent: ArrayReorderEvent = new ArrayReorderEvent(myArray, 1, 2, sessionId, username);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });
});
