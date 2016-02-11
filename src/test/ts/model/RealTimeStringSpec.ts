import DiscreteOperation from "../../../main/ts/ot/ops/DiscreteOperation";
import RealTimeString from "../../../main/ts/model/RealTimeString";
import StringSetOperation from "../../../main/ts/ot/ops/StringSetOperation";
import StringInsertOperation from "../../../main/ts/ot/ops/StringInsertOperation";
import StringRemoveOperation from "../../../main/ts/ot/ops/StringRemoveOperation";
import ModelOperationEvent from "../../../main/ts/model/ModelOperationEvent";
import {StringRemoveEvent} from "../../../main/ts/model/RealTimeString";
import {StringInsertEvent} from "../../../main/ts/model/RealTimeString";
import {StringSetValueEvent} from "../../../main/ts/model/RealTimeString";
import {ModelChangeEvent} from "../../../main/ts/model/events";

import * as chai from "chai";

var expect: any = chai.expect;

describe('RealTimeString', () => {

  var sessionId: string = "mySession";
  var username: string = "myUser";
  var version: number = 1;
  var timestamp: number = 100;

  var ignoreCallback: (op: DiscreteOperation) => void = (op: DiscreteOperation) => {
  };

  var lastOp: DiscreteOperation = null;
  var lastOpCallback: (op: DiscreteOperation) => void = (op: DiscreteOperation) => {
    lastOp = op;
  };

  var lastEvent: ModelChangeEvent = null;
  var lastEventCallback: (event: ModelChangeEvent) => void = (event: ModelChangeEvent) => {
    lastEvent = event;
  };

  it('Value is correct after creation', () => {
    var myString: RealTimeString = new RealTimeString("MyString", null, null, null);
    expect(myString.value()).to.equal("MyString");
  });

  it('Value is correct after set', () => {
    var myString: RealTimeString = new RealTimeString("MyString", null, null, ignoreCallback);
    myString.value("AnotherString");
    expect(myString.value()).to.equal("AnotherString");
  });

  it('Value is correct after insert', () => {
    var myString: RealTimeString = new RealTimeString("MyString", null, null, ignoreCallback);
    myString.insert(2, "Edited");
    expect(myString.value()).to.equal("MyEditedString");
  });

  it('Value is correct after remove', () => {
    var myString: RealTimeString = new RealTimeString("MyString", null, null, ignoreCallback);
    myString.remove(0, 2);
    expect(myString.value()).to.equal("String");
  });

  it('Correct operation is sent after set', () => {
    lastOp = null;
    var myString: RealTimeString = new RealTimeString("MyString", null, null, lastOpCallback);
    myString.value("AnotherString");

    var expectedOp: StringSetOperation = new StringSetOperation([], false, "AnotherString");
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after insert', () => {
    lastOp = null;
    var myString: RealTimeString = new RealTimeString("MyString", null, null, lastOpCallback);
    myString.insert(2, "Edited");

    var expectedOp: StringInsertOperation = new StringInsertOperation([], false, 2, "Edited");
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Correct operation is sent after remove', () => {
    lastOp = null;
    var myString: RealTimeString = new RealTimeString("MyString", null, null, lastOpCallback);
    myString.remove(0, 2);

    var expectedOp: StringRemoveOperation = new StringRemoveOperation([], false, 0, "My");
    expect(lastOp).to.deep.equal(expectedOp);
  });

  it('Value is correct after StringSetOperation', () => {
    var myString: RealTimeString = new RealTimeString("MyString", null, null, null);

    var incomingOp: StringSetOperation = new StringSetOperation([], false, "AnotherString");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingOp.path, incomingEvent);

    expect(myString.value()).to.equal("AnotherString");
  });

  it('Value is correct after StringInsertOperation', () => {
    var myString: RealTimeString = new RealTimeString("MyString", null, null, null);

    var incomingOp: StringInsertOperation = new StringInsertOperation([], false, 2, "Edited");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingOp.path, incomingEvent);

    expect(myString.value()).to.equal("MyEditedString");
  });

  it('Value is correct after StringRemoveOperation', () => {
    var myString: RealTimeString = new RealTimeString("MyString", null, null, null);

    var incomingOp: StringRemoveOperation = new StringRemoveOperation([], false, 0, "My");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingOp.path, incomingEvent);

    expect(myString.value()).to.equal("String");
  });

  it('Correct event is fired after StringSetOperation', () => {
    lastEvent = null;
    var myString: RealTimeString = new RealTimeString("MyString", null, null, null);
    myString.on(RealTimeString.Events.VALUE, lastEventCallback);

    var incomingOp: StringSetOperation = new StringSetOperation([], false, "AnotherString");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingOp.path, incomingEvent);

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
    var myString: RealTimeString = new RealTimeString("MyString", null, null, null);
    myString.on(RealTimeString.Events.INSERT, lastEventCallback);

    var incomingOp: StringInsertOperation = new StringInsertOperation([], false, 2, "Edited");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingOp.path, incomingEvent);

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
    var myString: RealTimeString = new RealTimeString("MyString", null, null, null);
    myString.on("Remove", lastEventCallback);

    var incomingOp: StringRemoveOperation = new StringRemoveOperation([], false, 0, "My");
    var incomingEvent: ModelOperationEvent = new ModelOperationEvent(sessionId, username, version, timestamp, incomingOp);
    myString._handleRemoteOperation(incomingOp.path, incomingEvent);

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
