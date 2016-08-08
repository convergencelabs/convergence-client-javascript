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


var expect: any = chai.expect;

describe('RealTimeBoolean', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var callbacks: ModelEventCallbacks;

  var gen: TestIdGenerator = new TestIdGenerator();
  var idGenerator: () => string = () => {
    return gen.id();
  };

  var model: RealTimeModel = <RealTimeModel><any>sinon.createStubInstance(RealTimeModel);

  var initialValue: BooleanValue =
    <BooleanValue>DataValueFactory.createDataValue(true, idGenerator);

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
    var myBoolean: RealTimeBoolean = new RealTimeBoolean(initialValue, null, null, null, model);
    expect(myBoolean.data()).to.equal(true);
  });

  it('Value is correct after set', () => {
    var myBoolean: RealTimeBoolean = new RealTimeBoolean(initialValue, null, null, callbacks, model);
    myBoolean.data(false);
    expect(myBoolean.data()).to.equal(false);
  });

  it('Correct operation is sent after set', () => {
    var myBoolean: RealTimeBoolean = new RealTimeBoolean(initialValue, null, null, callbacks, model);
    myBoolean.data(false);

    var expectedOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    expect((<any>callbacks.sendOperationCallback).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it('Value is correct after BooleanSetOperation', () => {
    var myBoolean: RealTimeBoolean = new RealTimeBoolean(initialValue, null, null, null, model);

    var incomingOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myBoolean._handleRemoteOperation(incomingEvent);

    expect(myBoolean.data()).to.equal(false);
  });

  it('Correct Event is fired after BooleanSetOperation', () => {
    lastEvent = null;
    var myBoolean: RealTimeBoolean = new RealTimeBoolean(initialValue, null, null, null, model);
    myBoolean.on(RealTimeBoolean.Events.VALUE, lastEventCallback);

    var incomingOp: BooleanSetOperation = new BooleanSetOperation(initialValue.id, false, false);
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myBoolean._handleRemoteOperation(incomingEvent);

    var expectedEvent: BooleanSetValueEvent = {
      src: myBoolean,
      name: RealTimeBoolean.Events.VALUE,
      sessionId: sessionId,
      username: username,
      version: version,
      timestamp: timestamp,
      value: false
    };
    expect(lastEvent).to.deep.equal(expectedEvent);
  });
});
