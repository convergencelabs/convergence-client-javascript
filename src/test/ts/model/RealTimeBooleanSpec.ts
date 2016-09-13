import {RealTimeBoolean} from "../../../main/ts/model/rt/RealTimeBoolean";
import {ModelOperationEvent} from "../../../main/ts/model/ModelOperationEvent";
import {BooleanSetOperation} from "../../../main/ts/model/ot/ops/BooleanSetOperation";
import {BooleanSetValueEvent} from "../../../main/ts/model/rt/RealTimeBoolean";
import {ModelEventCallbacks} from "../../../main/ts/model/rt/RealTimeModel";

import * as chai from "chai";
import * as sinon from "sinon";
import {TestIdGenerator} from "./TestIdGenerator";
import {BooleanValue} from "../../../main/ts/model/dataValue";
import {DataValueFactory} from "../../../main/ts/model/DataValueFactory";
import {RealTimeModel} from "../../../main/ts/model/rt/RealTimeModel";
import {ModelChangedEvent} from "../../../main/ts/model/observable/ObservableValue";
import {Model} from "../../../main/ts/model/internal/Model";
import {BooleanNode} from "../../../main/ts/model/internal/BooleanNode";
import {RealTimeWrapperFactory} from "../../../main/ts/model/rt/RealTimeWrapperFactory";


var expect: any = chai.expect;

describe('RealTimeBoolean', () => {

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

  var initialValue: BooleanValue =
    <BooleanValue>dataValueFactory.createDataValue(true);

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
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: BooleanNode = new BooleanNode(initialValue, () => {return [];}, model, sessionId, username);
    var myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    expect(myBoolean.data()).to.equal(true);
  });

  it('Value is correct after set', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: BooleanNode = new BooleanNode(initialValue, () => {return [];}, model, sessionId, username);
    var myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    myBoolean.data(false);
    expect(myBoolean.data()).to.equal(false);
  });

  it('Correct operation is sent after set', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: BooleanNode = new BooleanNode(initialValue, () => {return [];}, model, sessionId, username);
    var myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    myBoolean.data(false);

    var expectedOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    expect((<any>callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it('Value is correct after BooleanSetOperation', () => {
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: BooleanNode = new BooleanNode(initialValue, () => {return [];}, model, sessionId, username);
    var myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);

    var incomingOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myBoolean.data()).to.equal(false);
  });

  it('Correct Event is fired after BooleanSetOperation', () => {
    lastEvent = null;
    var wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks);
    var delegate: BooleanNode = new BooleanNode(initialValue, () => {return [];}, model, sessionId, username);
    var myBoolean: RealTimeBoolean = wrapperFactory.wrap(delegate);
    myBoolean.on(RealTimeBoolean.Events.VALUE, lastEventCallback);

    var incomingOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    var expectedEvent: BooleanSetValueEvent = {
      src: myBoolean,
      name: RealTimeBoolean.Events.VALUE,
      sessionId: sessionId,
      username: username,
      value: false
    };
    expect(lastEvent).to.deep.equal(expectedEvent);
  });
});
