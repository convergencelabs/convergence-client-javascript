/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {RealTimeDate, RealTimeModel, ModelEventCallbacks} from "../../main/model/rt";
import {ModelOperationEvent} from "../../main/model/ModelOperationEvent";
import {DateSetOperation} from "../../main/model/ot/ops/DateSetOperation";
import {TestIdGenerator} from "./TestIdGenerator";
import {DateValue} from "../../main/model/dataValue";
import {DataValueFactory} from "../../main/model/DataValueFactory";
import {Model} from "../../main/model/internal/Model";
import {DateNode} from "../../main/model/internal/DateNode";
import {RealTimeWrapperFactory} from "../../main/model/rt/RealTimeWrapperFactory";
import {ModelChangedEvent, DateSetValueEvent} from "../../main/model/events";
import {DomainUser, DomainUserType} from "../../main/identity";
import {IdentityCache} from "../../main/identity/IdentityCache";
import {ConvergenceSession} from "../../main";

import {expect} from "chai";
import {SinonSpy, spy, createStubInstance} from "sinon";

describe("RealTimeDate", () => {

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
    return  {
      read: true,
      write: true,
      remove: true,
      manage: true
    };
  };

  const testDate = new Date();

  const initialValue: DateValue = dataValueFactory.createDataValue(testDate) as DateValue;

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
    const delegate: DateNode = new DateNode(initialValue, () => [], model, session);
    const myDate: RealTimeDate = wrapperFactory.wrap(delegate);
    expect(myDate.value()).to.equal(testDate);
  });

  it("Value is correct after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: DateNode = new DateNode(initialValue, () => [], model, session);
    const myDate: RealTimeDate = wrapperFactory.wrap(delegate);
    const now = new Date();
    myDate.value(now);
    expect(myDate.value()).to.equal(now);
  });

  it("Correct operation is sent after set", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: DateNode = new DateNode(initialValue, () => [], model, session);
    const myDate: RealTimeDate = wrapperFactory.wrap(delegate);
    const now = new Date();
    myDate.value(now);

    const expectedOp: DateSetOperation = new DateSetOperation(initialValue.id, false, now);
    expect((callbacks.sendOperationCallback as SinonSpy).lastCall.args[0]).to.deep.equal(expectedOp);
  });

  it("Value is correct after DateSetOperation", () => {
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: DateNode = new DateNode(initialValue, () => [], model, session);
    const myDate: RealTimeDate = wrapperFactory.wrap(delegate);

    const now = new Date();
    const incomingOp: DateSetOperation = new DateSetOperation(initialValue.id, false, now);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    expect(myDate.value()).to.equal(now);
  });

  it("Correct Event is fired after DateSetOperation", () => {
    lastEvent = null;
    const wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(callbacks, rtModel, identityCache);
    const delegate: DateNode = new DateNode(initialValue, () => [], model, session);
    const myDate: RealTimeDate = wrapperFactory.wrap(delegate);
    myDate.on(RealTimeDate.Events.VALUE, lastEventCallback);

    const now = new Date();
    const incomingOp: DateSetOperation = new DateSetOperation(initialValue.id, false, now);
    const incomingEvent: ModelOperationEvent =
      new ModelOperationEvent(sessionId, user, version, timestamp, incomingOp);
    delegate._handleModelOperationEvent(incomingEvent);

    const expectedEvent: DateSetValueEvent = new DateSetValueEvent(myDate, user, sessionId, false);
    expect(lastEvent).to.deep.equal(expectedEvent);
  });
});
