import * as chai from "chai";
import * as sinon from "sinon";

import {RealTimeArray} from "../../../main/ts/model/RealTimeArray";
import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {ModelEventCallbacks} from "../../../main/ts/model/RealTimeModel";
import {ArrayValue} from "../../../main/ts/model/dataValue";
import {DataValue} from "../../../main/ts/model/dataValue";
import {TestIdGenerator} from "./TestIdGenerator";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {RealTimeModel} from "../../../main/ts/model/RealTimeModel";
import {ModelChangedEvent} from "../../../main/ts/model/RealTimeValue";
import {ArrayReplaceOperation} from "../../../main/ts/model/ot/ops/ArrayReplaceOperation";

var expect: any = chai.expect;

describe('RealTimeValue', () => {
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

  var arrayValue: ArrayValue =
    <ArrayValue>DataValueFactory.createDataValue(["A", "B", "C"], idGenerator);

  var subArrayValue: ArrayValue =
    <ArrayValue>DataValueFactory.createDataValue(["F", "G"], idGenerator);

  var subSubArrayValue: ArrayValue =
    <ArrayValue>DataValueFactory.createDataValue(["Q", "R"], idGenerator);

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

  var lastEvent: ModelChangedEvent = null;
  var lastEventCallback: (event: ModelChangedEvent) => void = (event: ModelChangedEvent) => {
    lastEvent = event;
  };

  it("model_changed event's relativePath is correct when a doubly nested array is changed", () => {
    var myArray: RealTimeArray = new RealTimeArray(arrayValue, null, null, null, model);
    myArray.on(RealTimeArray.Events.MODEL_CHANGED, lastEventCallback);

    var nestedArray: RealTimeArray = new RealTimeArray(subArrayValue, myArray, 2, null, model);
    var subNestedArray: RealTimeArray = new RealTimeArray(subSubArrayValue, nestedArray, 0, null, model);
    var newValue: DataValue = DataValueFactory.createDataValue("Z", idGenerator);

    var incomingOp: ArrayReplaceOperation = new ArrayReplaceOperation(subNestedArray.id(), false, 1, newValue);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    subNestedArray._handleRemoteOperation(incomingEvent);

    expect(lastEvent.relativePath).to.deep.equal([2, 0]);
  });
});
