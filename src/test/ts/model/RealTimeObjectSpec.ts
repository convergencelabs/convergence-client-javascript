import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {RealTimeObject} from "../../../main/ts/model/rt/RealTimeObject";
import {ObjectSetOperation} from "../../../main/ts/model/ot/ops/ObjectSetOperation";
import {ModelEventCallbacks} from "../../../main/ts/model/rt/RealTimeModel";
import {ObjectValue} from "../../../main/ts/model/dataValue";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {TestIdGenerator} from "./TestIdGenerator";
import {DataValue} from "../../../main/ts/model/dataValue";

import * as chai from "chai";
import * as sinon from "sinon";
import SinonSpy = Sinon.SinonSpy;
import {RealTimeModel} from "../../../main/ts/model/rt/RealTimeModel";
import {RealTimeWrapperFactory} from "../../../main/ts/model/rt/RealTimeWrapperFactory";
import {Model} from "../../../main/ts/model/internal/Model";
import {ObjectNode} from "../../../main/ts/model/internal/ObjectNode";

var expect: any = chai.expect;

describe('RealTimeObject', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var callbacks: ModelEventCallbacks;

  var gen: TestIdGenerator = new TestIdGenerator();

  var dataValueFactory: DataValueFactory = new DataValueFactory(() => {
    return gen.id();
  });

  var model: Model = <Model><any>sinon.createStubInstance(Model);
  var rtModel: RealTimeModel = <RealTimeModel><any>sinon.createStubInstance(RealTimeModel);
  rtModel.emitLocalEvents = () => {
    return false;
  };

  var initialValue: ObjectValue =
    <ObjectValue>dataValueFactory.createDataValue({"num": 5});

  var setValue: {[key: string]: DataValue} = {
    string: dataValueFactory.createDataValue("test")
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
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: ObjectNode = new ObjectNode(initialValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myObject: RealTimeObject = <RealTimeObject> wrapperFactory.wrap(delegate);
    expect(myObject.data()).to.deep.equal({"num": 5});
  });

  it('Value is correct after set', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: ObjectNode = new ObjectNode(initialValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myObject: RealTimeObject = <RealTimeObject> wrapperFactory.wrap(delegate);
    myObject.data({"string": "test"});
    expect(myObject.data()).to.deep.equal({"string": "test"});
  });

  it('Value is correct after setProperty', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: ObjectNode = new ObjectNode(initialValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myObject: RealTimeObject = <RealTimeObject> wrapperFactory.wrap(delegate);
    myObject.set("num", 10);
    expect(myObject.get("num").data()).to.deep.equal(10);
  });

  it('Correct operation is sent after set', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: ObjectNode = new ObjectNode(initialValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myObject: RealTimeObject = <RealTimeObject> wrapperFactory.wrap(delegate);
    myObject.data({string: "test"});

    var expectedOp: ObjectSetOperation = new ObjectSetOperation(initialValue.id, false, setValue);
    // expect((<any>callbacks.sendOperationCallback).lastCall.args[0]).to.be.deep.equal(expectedOp);
  });

  it('Value is correct after ObjectSetOperation', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: ObjectNode = new ObjectNode(initialValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myObject: RealTimeObject = <RealTimeObject> wrapperFactory.wrap(delegate);

    var incomingOp: ObjectSetOperation = new ObjectSetOperation(initialValue.id, false, setValue);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myObject.data()).to.deep.equal({"string": "test"});
  });

  it('Correct Event is fired after ObjectSetOperation', () => {
    var eventCallback: SinonSpy = sinon.spy();
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel);
    var delegate: ObjectNode = new ObjectNode(initialValue, () => {return [];}, model, sessionId, username, dataValueFactory);
    var myObject: RealTimeObject = <RealTimeObject> wrapperFactory.wrap(delegate);
    myObject.on(RealTimeObject.Events.VALUE, eventCallback);

    var incomingOp: ObjectSetOperation = new ObjectSetOperation(initialValue.id, false, setValue);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    // var expectedEvent: ObjectSetValueEvent = {
    //  src: myObject,
    //  name: RealTimeObject.Events.VALUE,
    //  sessionId: sessionId,
    //  userId: username,
    //  version: version,
    //  timestamp: timestamp,
    //  value: {"string": "test"}
    // };
    // expect(eventCallback.lastCall.args[0]).to.deep.equal(expectedEvent);
  });
});
