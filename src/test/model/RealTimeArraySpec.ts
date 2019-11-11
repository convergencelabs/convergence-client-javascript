import {ArraySetOperation} from "../../main/model/ot/ops/ArraySetOperation";
import {ArrayInsertOperation} from "../../main/model/ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../../main/model/ot/ops/ArrayRemoveOperation";
import {ArrayReplaceOperation} from "../../main/model/ot/ops/ArrayReplaceOperation";
import {ArrayMoveOperation} from "../../main/model/ot/ops/ArrayMoveOperation";
import {ModelOperationEvent} from "../../main/model/ModelOperationEvent";
import {TestIdGenerator} from "./TestIdGenerator";
import {DataValueFactory} from "../../main/model/DataValueFactory";
import {DataValue, StringValue, DataValueType, ArrayValue} from "../../main/model/dataValue";
import {Model} from "../../main/model/internal/Model";
import {ArrayNode} from "../../main/model/internal/ArrayNode";
import {RealTimeWrapperFactory} from "../../main/model/rt/RealTimeWrapperFactory";
import {
  ArraySetValueEvent,
  ArrayInsertEvent,
  ArrayRemoveEvent,
  ArraySetEvent,
  ArrayReorderEvent
} from "../../main/model/events";
import {
  RealTimeElement,
  RealTimeArray,
  RealTimeString,
  RealTimeModel,
  ModelEventCallbacks
} from "../../main/model/rt";
import {StringNode} from "../../main/model/internal/StringNode";
import {IdentityCache} from "../../main/identity/IdentityCache";
import {ConvergenceSession, DomainUser, DomainUserType} from "../../main";
import {expect} from "chai";
import {SinonSpy, spy, createStubInstance} from "sinon";

describe("RealTimeArray", () => {

  const sessionId: string = "mySession";
  const username: string = "myUser";
  const user = new DomainUser(DomainUserType.NORMAL, username, "", "", "", "");
  const version: number = 1;
  const timestamp: Date = new Date();

  const gen: TestIdGenerator = new TestIdGenerator();

  const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
    return gen.id();
  });

  const model = createStubInstance(Model) as any as Model;
  const identityCache = createStubInstance(IdentityCache) as any as IdentityCache;
  const session = createStubInstance(ConvergenceSession) as any as ConvergenceSession;
  const rtModel = createStubInstance(RealTimeModel) as any as RealTimeModel;
  rtModel.permissions = () => {
    return {
      read: true,
      write: true,
      remove: true,
      manage: true
    };
  };
  rtModel.emitLocalEvents = () => {
    return false;
  };

  const primitiveValue: any[] = ["A", "B", "C"];

  const arrayValue: ArrayValue = dataValueFactory.createDataValue(primitiveValue) as ArrayValue;

  const newArray: DataValue[] = [
    dataValueFactory.createDataValue("X"),
    dataValueFactory.createDataValue("Y"),
    dataValueFactory.createDataValue("Z")
  ];

  let callbacks: ModelEventCallbacks;

  beforeEach(() => {
    callbacks = {
      sendOperationCallback: spy(),
      referenceEventCallbacks: {
        onShare: spy(),
        onUnShare: spy(),
        onSet: spy(),
        onClear: spy()
      }
    };
  });

  let lastEvent: any = null;
  const lastEventCallback: (event: any) => void = (event: any) => {
    lastEvent = event;
  };

  it("Value is correct after creation", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    expect(myArray.value()).to.deep.equal(primitiveValue);
  });

  it("Value is correct after set", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.value(["X", "Y", "Z"]);
    expect(myArray.value()).to.deep.equal(["X", "Y", "Z"]);
  });

  it("Value is correct after insert", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.insert(2, "X");
    expect(myArray.value()).to.deep.equal(["A", "B", "X", "C"]);
  });

  it("Value is correct after remove", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.remove(1);
    expect(myArray.value()).to.deep.equal(["A", "C"]);
  });

  it("Value is correct after set", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.set(1, "X");
    expect(myArray.value()).to.deep.equal(["A", "X", "C"]);
  });

  it("Value is correct after move", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.reorder(1, 2);
    expect(myArray.value()).to.deep.equal(["A", "C", "B"]);
  });

  it("Correct operation is sent after set value", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.value(["X", "Y", "Z"]);

    const expectedDataValue: DataValue[] = [
      {id: myArray.get(0).id(), type: DataValueType.STRING, value: "X"} as StringValue,
      {id: myArray.get(1).id(), type: DataValueType.STRING, value: "Y"} as StringValue,
      {id: myArray.get(2).id(), type: DataValueType.STRING, value: "Z"} as StringValue,
    ];

    const opSpy: SinonSpy = callbacks.sendOperationCallback as SinonSpy;
    expect(opSpy.called).to.be.true;
    const expectedOp: ArraySetOperation = new ArraySetOperation(myArray.id(), false, expectedDataValue);
    expect(opSpy.args[0][0]).to.deep.equal(expectedOp);
  });

  it("Correct operation is sent after insert", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    const value: RealTimeElement<any> = myArray.insert(2, "X");
    const expectedDataValue: StringValue = {
      id: value.id(),
      type: DataValueType.STRING,
      value: "X"
    };

    const opSpy = callbacks.sendOperationCallback as SinonSpy;
    expect(opSpy.called).to.be.true;
    const expectedOp: ArrayInsertOperation = new ArrayInsertOperation(myArray.id(), false, 2, expectedDataValue);
    expect(opSpy.args[0][0]).to.deep.equal(expectedOp);
  });

  it("Correct operation is sent after remove", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.remove(1);

    const opSpy: SinonSpy = callbacks.sendOperationCallback as SinonSpy;
    expect(opSpy.called).to.be.true;
    const expectedOp: ArrayRemoveOperation = new ArrayRemoveOperation(myArray.id(), false, 1);
    expect(opSpy.args[0][0]).to.deep.equal(expectedOp);
  });

  it("Correct operation is sent after set", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    const value: RealTimeElement<any> = myArray.set(1, "X");

    const expectedDataValue: StringValue = {
      id: value.id(),
      type: DataValueType.STRING,
      value: "X"
    };

    const opSpy: SinonSpy = callbacks.sendOperationCallback as SinonSpy;
    expect(opSpy.called).to.be.true;
    const expectedOp: ArrayReplaceOperation = new ArrayReplaceOperation(myArray.id(), false, 1, expectedDataValue);
    expect(opSpy.args[0][0]).to.deep.equal(expectedOp);
  });

  it("Correct operation is sent after move", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.reorder(1, 2);

    const opSpy: SinonSpy = callbacks.sendOperationCallback as SinonSpy;
    expect(opSpy.called).to.be.true;
    const expectedOp: ArrayMoveOperation = new ArrayMoveOperation(myArray.id(), false, 1, 2);
    expect(opSpy.args[0][0]).to.deep.equal(expectedOp);
  });

  it("Value is correct after ArraySetOperation", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;

    const incomingOp: ArraySetOperation = new ArraySetOperation(arrayValue.id, false, newArray);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myArray.value()).to.deep.equal(["X", "Y", "Z"]);
  });

  it("Value is correct after ArrayInsertOperation", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;

    const newValue: DataValue = dataValueFactory.createDataValue("X");

    const incomingOp: ArrayInsertOperation = new ArrayInsertOperation(arrayValue.id, false, 2, newValue);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "B", "X", "C"]);
  });

  it("Value is correct after ArrayRemoveOperation", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;

    const incomingOp: ArrayRemoveOperation = new ArrayRemoveOperation(arrayValue.id, false, 1);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "C"]);
  });

  it("Value is correct after ArrayReplaceOperation", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;

    const incomingOp: ArrayReplaceOperation =
      new ArrayReplaceOperation(arrayValue.id, false, 1, dataValueFactory.createDataValue("X"));
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "X", "C"]);
  });

  it("Value is correct after ArrayMoveOperation", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;

    const incomingOp: ArrayMoveOperation =
      new ArrayMoveOperation(arrayValue.id, false, 1, 2);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myArray.value()).to.deep.equal(["A", "C", "B"]);
  });

  it("Correct event is fired after ArraySetOperation", () => {
    lastEvent = null;
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.on(RealTimeArray.Events.VALUE, lastEventCallback);

    const incomingOp: ArraySetOperation = new ArraySetOperation(arrayValue.id, false, newArray);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: ArraySetValueEvent = new ArraySetValueEvent(myArray, user, sessionId, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it("Correct event is fired after ArrayInsertOperation", () => {
    lastEvent = null;
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.on(RealTimeArray.Events.INSERT, lastEventCallback);

    const newValue: DataValue = dataValueFactory.createDataValue("X");
    const incomingOp: ArrayInsertOperation = new ArrayInsertOperation(arrayValue.id, false, 2, newValue);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: ArrayInsertEvent =
      new ArrayInsertEvent(myArray, user, sessionId, false, 2, myArray.get(2));
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it("Correct event is fired after ArrayRemoveOperation", () => {
    lastEvent = null;
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.on(RealTimeArray.Events.REMOVE, lastEventCallback);
    const oldStringElement: RealTimeString = wrapperFactory.wrap(delegate.get(1)) as RealTimeString;

    const incomingOp: ArrayRemoveOperation = new ArrayRemoveOperation(arrayValue.id, false, 1);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: ArrayRemoveEvent =
      new ArrayRemoveEvent(myArray, user, sessionId, false, 1, oldStringElement);
    expect(lastEvent.element).to.equal(expectedEvent.element);
    expect(lastEvent.index).to.equal(expectedEvent.index);
    expect(lastEvent.oldValue.value()).to.equal(lastEvent.oldValue.value());
    expect(lastEvent.sessionId).to.equal(expectedEvent.sessionId);
    expect(lastEvent.user).to.equal(expectedEvent.user);
    expect(lastEvent.local).to.equal(expectedEvent.local);
  });

  it("Correct event is fired after ArrayReplaceOperation", () => {
    lastEvent = null;
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.on(RealTimeArray.Events.SET, lastEventCallback);
    const oldElement = myArray.get(1);

    const newValue: DataValue = dataValueFactory.createDataValue("X");
    const incomingOp: ArrayReplaceOperation = new ArrayReplaceOperation(arrayValue.id, false, 1, newValue);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const valueDelegate: StringNode =
      new StringNode(newValue as StringValue, () => [], model, session);

    const stringElement: RealTimeString = wrapperFactory.wrap(valueDelegate) as RealTimeString;
    const expectedEvent: ArraySetEvent =
      new ArraySetEvent(myArray, user, sessionId, false, 1, stringElement, oldElement);

    expect(lastEvent.element).to.equal(expectedEvent.element);
    expect(lastEvent.index).to.equal(expectedEvent.index);
    expect(lastEvent.value).to.equal(expectedEvent.value);
    expect(lastEvent.oldValue.value()).to.equal(lastEvent.oldValue.value());
    expect(lastEvent.sessionId).to.equal(expectedEvent.sessionId);
    expect(lastEvent.user).to.equal(expectedEvent.user);
    expect(lastEvent.local).to.equal(expectedEvent.local);
  });

  it("Correct event is fired after ArrayMoveOperation", () => {
    lastEvent = null;
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.on(RealTimeArray.Events.REORDER, lastEventCallback);

    const incomingOp: ArrayMoveOperation = new ArrayMoveOperation(arrayValue.id, false, 1, 2);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: ArrayReorderEvent = new ArrayReorderEvent(myArray, user, sessionId, false, 1, 2);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it("ForEach is called on all elements", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    myArray.forEach((element: RealTimeElement<any>) => {
      element.value("R");
    });
    expect(myArray.value()).to.deep.equal(["R", "R", "R"]);
  });

  it("Some returns true if callback returns true for any element", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    const some = myArray.some((element: RealTimeElement<any>) => {
      return element.value() === "A";
    });
    expect(some).to.deep.equal(true);
  });

  it("Some returns false if callback returns false for all elements", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    const some = myArray.some((element: RealTimeElement<any>) => {
      return element.value() === "R";
    });
    expect(some).to.deep.equal(false);
  });

  it("Every returns true if callback returns true for all elements", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    const every = myArray.every((element: RealTimeElement<any>) => {
      return element instanceof RealTimeString;
    });
    expect(every).to.deep.equal(true);
  });

  it("Every returns false if callback returns false for any element", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    const every = myArray.every((element: RealTimeElement<any>) => {
      return element.value() === "A";
    });
    expect(every).to.deep.equal(false);
  });

  it("Find returns the correct element", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    const found = myArray.find((element: RealTimeElement<any>) => {
      return element.value() === "B";
    });
    expect(found.value()).to.deep.equal("B");
  });

  it("Find returns undefined if nothing is found", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    const found = myArray.find((element: RealTimeElement<any>) => {
      return element.value() === "R";
    });
    expect(found).to.deep.equal(undefined);
  });

  it("FindIndex returns the correct index", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    const foundIndex = myArray.findIndex((element: RealTimeElement<any>) => {
      return element.value() === "B";
    });
    expect(foundIndex).to.deep.equal(1);
  });

  it("FindIndex returns undefined if nothing is found", () => {
    const wrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: ArrayNode =
      new ArrayNode(arrayValue, () => [], model, session, dataValueFactory);
    const myArray: RealTimeArray = wrapperFactory.wrap(delegate) as RealTimeArray;
    const foundIndex = myArray.find((element: RealTimeElement<any>) => {
      return element.value() === "R";
    });
    expect(foundIndex).to.deep.equal(undefined);
  });
});
