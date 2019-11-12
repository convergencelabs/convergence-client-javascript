/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {RealTimeNumber, RealTimeModel, ModelEventCallbacks} from "../../main/model/rt";
import {NumberDeltaOperation} from "../../main/model/ot/ops/NumberDeltaOperation";
import {NumberSetOperation} from "../../main/model/ot/ops/NumberSetOperation";
import {ModelOperationEvent} from "../../main/model/ModelOperationEvent";
import {NumberValue} from "../../main/model/dataValue";
import {TestIdGenerator} from "./TestIdGenerator";
import {DataValueFactory} from "../../main/model/DataValueFactory";
import {Model} from "../../main/model/internal/Model";
import {NumberNode} from "../../main/model/internal/NumberNode";
import {RealTimeWrapperFactory} from "../../main/model/rt/RealTimeWrapperFactory";
import {ModelChangedEvent, NumberDeltaEvent, NumberSetValueEvent} from "../../main/model/events";
import {DomainUser, DomainUserType} from "../../main/identity";
import {IdentityCache} from "../../main/identity/IdentityCache";
import {ConvergenceSession} from "../../main";

import {expect} from "chai";
import {SinonSpy, spy, createStubInstance} from "sinon";

describe("RealTimeNumber", () => {

  const sessionId: string = "mySession";
  const username: string = "myUser";
  const user = new DomainUser(DomainUserType.NORMAL, username, "", "", "", "");
  const version: number = 1;
  const timestamp = new Date();

  const gen: TestIdGenerator = new TestIdGenerator();

  const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
    return gen.id();
  });

  const model = createStubInstance(Model) as any as Model;
  const identityCache = createStubInstance(IdentityCache) as any as IdentityCache;
  const session = createStubInstance(ConvergenceSession) as any as ConvergenceSession;
  const rtModel = createStubInstance(RealTimeModel) as any as RealTimeModel;
  rtModel.emitLocalEvents = () => {
    return false;
  };
  rtModel.permissions = () => {
    return {
      read: true,
      write: true,
      remove: true,
      manage: true
    };
  };

  const initialValue: NumberValue = dataValueFactory.createDataValue(10) as NumberValue;

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

  let lastEvent: ModelChangedEvent = null;
  const lastEventCallback: (event: ModelChangedEvent) => void = (event: ModelChangedEvent) => {
    lastEvent = event;
  };

  it("Value is correct after creation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: NumberNode = new NumberNode(initialValue, () => [], model, session);
    const myNumber: RealTimeNumber = wrapperFactory.wrap(delegate) as RealTimeNumber;
    expect(myNumber.value()).to.equal(10);
  });

  it("Value is correct after add", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: NumberNode = new NumberNode(initialValue, () => [], model, session);
    const myNumber: RealTimeNumber = wrapperFactory.wrap(delegate) as RealTimeNumber;
    myNumber.add(5);
    expect(myNumber.value()).to.equal(15);
  });

  it("Value is correct after subtract", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: NumberNode = new NumberNode(initialValue, () => [], model, session);
    const myNumber: RealTimeNumber = wrapperFactory.wrap(delegate) as RealTimeNumber;
    myNumber.subtract(5);
    expect(myNumber.value()).to.equal(5);
  });

  it("Returned value is correct after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: NumberNode = new NumberNode(initialValue, () => [], model, session);
    const myNumber: RealTimeNumber = wrapperFactory.wrap(delegate) as RealTimeNumber;
    myNumber.value(20);
    expect(myNumber.value()).to.equal(20);
  });

  it("Correct operation is sent after add", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: NumberNode = new NumberNode(initialValue, () => [], model, session);
    const myNumber: RealTimeNumber = wrapperFactory.wrap(delegate) as RealTimeNumber;
    myNumber.add(5);

    const opSpy: SinonSpy = callbacks.sendOperationCallback as SinonSpy;
    expect(opSpy.called).to.be.true;
    const expectedOp: NumberDeltaOperation = new NumberDeltaOperation(myNumber.id(), false, 5);
    expect(opSpy.args[0][0]).to.deep.equal(expectedOp);
  });

  it("Correct operation is sent after subtract", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: NumberNode = new NumberNode(initialValue, () => [], model, session);
    const myNumber: RealTimeNumber = wrapperFactory.wrap(delegate) as RealTimeNumber;
    myNumber.subtract(5);

    const opSpy = callbacks.sendOperationCallback as SinonSpy;
    expect(opSpy.called).to.be.true;
    const expectedOp: NumberDeltaOperation = new NumberDeltaOperation(myNumber.id(), false, -5);
    expect(opSpy.args[0][0]).to.deep.equal(expectedOp);
  });

  it("Correct operation is sent after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: NumberNode = new NumberNode(initialValue, () => [], model, session);
    const myNumber: RealTimeNumber = wrapperFactory.wrap(delegate) as RealTimeNumber;
    myNumber.value(20);

    const opSpy = callbacks.sendOperationCallback as SinonSpy;
    expect(opSpy.called).to.be.true;
    const expectedOp: NumberSetOperation = new NumberSetOperation(myNumber.id(), false, 20);
    expect(opSpy.args[0][0]).to.deep.equal(expectedOp);
  });

  it("Value is correct after NumberDeltaOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: NumberNode = new NumberNode(initialValue, () => [], model, session);
    const myNumber: RealTimeNumber = wrapperFactory.wrap(delegate) as RealTimeNumber;

    const incomingOp: NumberDeltaOperation = new NumberDeltaOperation(initialValue.id, false, 5);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myNumber.value()).to.equal(15);
  });

  it("Value is correct after NumberSetOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: NumberNode = new NumberNode(initialValue, () => [], model, session);
    const myNumber: RealTimeNumber = wrapperFactory.wrap(delegate) as RealTimeNumber;

    const incomingOp: NumberSetOperation = new NumberSetOperation(initialValue.id, false, 20);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);

    delegate._handleModelOperationEvent(incomingEvent);

    expect(myNumber.value()).to.equal(20);
  });

  it("Correct Event is fired after NumberDeltaOperation", () => {
    lastEvent = null;
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: NumberNode = new NumberNode(initialValue, () => [], model, session);
    const myNumber: RealTimeNumber = wrapperFactory.wrap(delegate) as RealTimeNumber;
    myNumber.on(RealTimeNumber.Events.DELTA, lastEventCallback);

    const incomingOp: NumberDeltaOperation = new NumberDeltaOperation(initialValue.id, false, 5);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: NumberDeltaEvent = new NumberDeltaEvent(myNumber, user, sessionId, false, 5);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

  it("Correct Event is fired after NumberSetOperation", () => {
    lastEvent = null;
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: NumberNode = new NumberNode(initialValue, () => [], model, session);
    const myNumber: RealTimeNumber = wrapperFactory.wrap(delegate) as RealTimeNumber;
    myNumber.on(RealTimeNumber.Events.VALUE, lastEventCallback);

    const incomingOp: NumberSetOperation = new NumberSetOperation(initialValue.id, false, 20);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: NumberSetValueEvent =
      new NumberSetValueEvent(myNumber, user, sessionId, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });

});
