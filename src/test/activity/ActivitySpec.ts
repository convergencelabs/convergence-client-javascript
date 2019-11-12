/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IdentityCache} from "../../main/identity/IdentityCache";
import {
  Activity,
  ActivitySessionJoinedEvent, ActivityStateClearedEvent,
  ActivityStateDeltaEvent,
  ActivityStateRemovedEvent,
  ActivityStateSetEvent,
  ConvergenceDomain,
  ConvergenceSession,
  DomainUser,
  DomainUserType,
  StringMap
} from "../../main";
import {ConvergenceConnection, IConnectionEvent, MessageEvent} from "../../main/connection/ConvergenceConnection";
import {Subject} from "rxjs";
import {Deferred} from "../../main/util/Deferred";
import {ActivityLeftEvent} from "../../main/activity/events/ActivityLeftEvent";
import {mapObjectValues} from "../../main/util/ObjectUtils";
import {jsonToProtoValue} from "../../main/connection/ProtocolUtil";
import {expect, assert} from "chai";
import {createStubInstance, SinonStub, match} from "sinon";

const ACTIVITY_ID = "test";
const RECONNECT_TOKEN = "reconnectToken";

const LOCAL_SESSION_ID = "localSession";
const LOCAL_USER = new DomainUser(
  DomainUserType.NORMAL,
  "localUser",
  "local",
  "user",
  "Test User",
  "local@example.com");

const REMOTE_SESSION_ID = "remoteSession1";

const REMOTE_USER_1 = new DomainUser(
  DomainUserType.NORMAL,
  "remoteUser",
  "remote",
  "user",
  "Remote User",
  "remote1@example.com");

const IDENTITY_CACHE = mockIdentityCache([
  {user: LOCAL_USER, sessionIds: [LOCAL_SESSION_ID]},
  {user: REMOTE_USER_1, sessionIds: [REMOTE_SESSION_ID]},
]);

const REMOTE_1_JOIN_MESSAGE: MessageEvent = {
  message: {
    activitySessionJoined: {
      activityId: ACTIVITY_ID,
      sessionId: REMOTE_SESSION_ID,
      state: {
        cursor: {numberValue: 10},
        selected: {boolValue: false},
        id: {stringValue: "someId"}
      },
    },
  },
  name: "message",
  request: false
};

describe("Activity", () => {

  describe("incoming messages", () => {

    it("activitySessionJoined message is handled correctly ", (done: MochaDone) => {
      const connection = mockConnection();
      mockJoin(connection);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();

      activity._whenJoined().then(() => {
        activity.events().subscribe((e) => {
          if (e instanceof ActivitySessionJoinedEvent) {
            expect(e.sessionId).to.eq(REMOTE_SESSION_ID);
            expect(e.activity).to.eq(activity);
            expect(e.participant).to.exist;
            expect(e.participant.user).to.eq(REMOTE_USER_1);
            expect(e.participant.sessionId).to.eq(REMOTE_SESSION_ID);
            expect(e.participant.state.get("cursor")).to.eq(10);

            const participants = activity.participants();
            expect(participants).to.exist;
            expect(participants.map(p => p.sessionId))
              .to.have.members([LOCAL_SESSION_ID, REMOTE_SESSION_ID]);

            done();
          }
        });

        connection.messageSubject.next(REMOTE_1_JOIN_MESSAGE);
      });
    });

    it("activityStateUpdated for setting state is handled correctly", (done: MochaDone) => {
      const connection = mockConnection();
      mockJoin(connection);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();

      const cursorEvent = new Deferred<void>();
      const messageEvent = new Deferred<void>();
      const deltaEvent = new Deferred<void>();

      activity._whenJoined().then(() => {
        activity.events().subscribe((e) => {
          if (e instanceof ActivityStateSetEvent) {
            expect(e.sessionId).to.eq(REMOTE_SESSION_ID);
            expect(e.user).to.eq(REMOTE_USER_1);
            expect(e.activity).to.eq(activity);
            expect(e.local).to.be.false;

            if (e.key === "cursor") {
              expect(e.value).to.eq(12);
              expect(e.oldValue).to.eq(10);
              cursorEvent.resolve();
            } else if (e.key === "message") {
              expect(e.value).to.eq("foo");
              expect(e.oldValue).to.be.undefined;
              messageEvent.resolve();
            } else {
              expect.fail();
            }
          } else if (e instanceof ActivityStateDeltaEvent) {
            expect(e.complete).to.be.false;
            expect(e.removed).to.be.empty;
            expect(e.values).to.deep.equal(new Map<string, any>([["cursor", 12], ["message", "foo"]]));
            expect(e.oldValues).to.deep.equal(new Map<string, any>([["cursor", 10], ["message", undefined]]));
            deltaEvent.resolve();
          }
        });

        connection.messageSubject.next(REMOTE_1_JOIN_MESSAGE);
        connection.messageSubject.next({
          message: {
            activityStateUpdated: {
              activityId: ACTIVITY_ID,
              sessionId: REMOTE_SESSION_ID,
              set: {
                cursor: {numberValue: 12},
                message: {stringValue: "foo"},
              },
              complete: false,
              removed: []
            }
          },
          name: "message",
          request: false
        });
      });
      Promise
        .all([cursorEvent.promise(), messageEvent.promise(), deltaEvent.promise()])
        .then(() => {
          const participant = activity.participant(REMOTE_SESSION_ID);
          expect(participant).to.exist;
          const expectedState = new Map<string, any>();
          expectedState.set("cursor", 12).set("selected", false).set("message", "foo").set("id", "someId");
          expect(participant.state).to.deep.equal(expectedState);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it("activityStateUpdated for removing state is handled correctly ", (done: MochaDone) => {
      const connection = mockConnection();
      mockJoin(connection);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();

      const cursorEvent = new Deferred<void>();
      const selectedEvent = new Deferred<void>();
      const deltaEvent = new Deferred<void>();

      activity._whenJoined().then(() => {
        activity.events().subscribe((e) => {
          if (e instanceof ActivityStateRemovedEvent) {
            expect(e.sessionId).to.eq(REMOTE_SESSION_ID);
            expect(e.user).to.eq(REMOTE_USER_1);
            expect(e.activity).to.eq(activity);
            expect(e.local).to.be.false;

            if (e.key === "cursor") {
              expect(e.oldValue).to.eq(10);
              cursorEvent.resolve();
            } else if (e.key === "selected") {
              expect(e.oldValue).to.eq(false);
              selectedEvent.resolve();
            } else {
              expect.fail();
            }
          } else if (e instanceof ActivityStateDeltaEvent) {
            expect(e.complete).to.be.false;
            expect(e.removed).to.deep.equal(["cursor", "selected"]);
            expect(e.values).to.deep.equal(new Map<string, any>([]));
            expect(e.oldValues).to.deep.equal(new Map<string, any>([["cursor", 10], ["selected", false]]));
            deltaEvent.resolve();
          }
        });

        connection.messageSubject.next(REMOTE_1_JOIN_MESSAGE);
        connection.messageSubject.next({
          message: {
            activityStateUpdated: {
              activityId: ACTIVITY_ID,
              sessionId: REMOTE_SESSION_ID,
              set: {},
              complete: false,
              removed: ["cursor", "selected"]
            }
          },
          name: "message",
          request: false
        });
      });
      Promise
        .all([cursorEvent.promise(), selectedEvent.promise(), deltaEvent.promise()])
        .then(() => {
          const participant = activity.participant(REMOTE_SESSION_ID);
          expect(participant).to.exist;
          const expectedState = new Map<string, any>([["id", "someId"]]);
          expect(participant.state).to.deep.equal(expectedState);
          done();
        })
        .catch(e => {
          done(e);
        });
    });

    it("activityStateUpdated for clearing state is handled correctly ", (done: MochaDone) => {
      const connection = mockConnection();
      mockJoin(connection);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();

      const clearedEvent = new Deferred<void>();
      const deltaEvent = new Deferred<void>();

      activity._whenJoined().then(() => {
        activity.events().subscribe((e) => {
          if (e instanceof ActivityStateClearedEvent) {
            expect(e.sessionId).to.eq(REMOTE_SESSION_ID);
            expect(e.user).to.eq(REMOTE_USER_1);
            expect(e.activity).to.eq(activity);
            expect(e.local).to.be.false;

            clearedEvent.resolve();
          } else if (e instanceof ActivityStateDeltaEvent) {
            expect(e.complete).to.be.true;
            expect(e.removed).to.deep.equal([]);
            expect(e.values).to.deep.equal(new Map<string, any>([]));
            expect(e.oldValues).to.deep.equal(
              new Map<string, any>([["cursor", 10], ["selected", false], ["id", "someId"]]));
            deltaEvent.resolve();
          }
        });

        connection.messageSubject.next(REMOTE_1_JOIN_MESSAGE);
        connection.messageSubject.next({
          message: {
            activityStateUpdated: {
              activityId: ACTIVITY_ID,
              sessionId: REMOTE_SESSION_ID,
              set: {},
              complete: true,
              removed: []
            }
          },
          name: "message",
          request: false
        });
      });
      Promise
        .all([clearedEvent.promise(), deltaEvent.promise()])
        .then(() => {
          const participant = activity.participant(REMOTE_SESSION_ID);
          expect(participant).to.exist;
          const expectedState = new Map<string, any>();
          expect(participant.state).to.deep.equal(expectedState);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  });

  describe("leave()", () => {
    it("leave emits correct event", (done: MochaDone) => {
      const connection = mockConnection();
      mockJoin(connection);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();

      const leftDeferred = new Deferred<void>();

      activity._whenJoined().then(() => {
        activity.events().subscribe((e) => {
          if (e instanceof ActivityLeftEvent) {
            expect(e.sessionId).to.eq(LOCAL_SESSION_ID);
            expect(e.user).to.eq(LOCAL_USER);
            expect(e.activity).to.eq(activity);
            expect(e.local).to.be.true;

            leftDeferred.resolve();
          }
        });
        activity.leave();
      });
      leftDeferred.promise()
        .then(() => done())
        .catch(e => done(e));
    });

    it("isJoined() is false after leave", (done: MochaDone) => {
      const connection = mockConnection();
      mockJoin(connection);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        activity.leave();
        expect(activity.isJoined()).to.be.false;
        done();
      }).catch(e => done(e));
    });

    it("leave sends correct message", (done: MochaDone) => {
      const connection = mockConnection();
      mockJoin(connection);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();

      activity._whenJoined().then(() => {
        activity.leave();
        assert(connection.sendStub.calledWith({
          activityLeaveRequest: {activityId: ACTIVITY_ID}
        }));
        done();
      }).catch(e => done(e));
    });
  });

  describe("setState()", () => {
    it("key-value set of new property handled correctly", (done: MochaDone) => {
      const initialState = {key1: true, key2: false};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(initialState);
        activity.setState("key3", "value");
        const expected = {...initialState, ...{key3: "value"}};
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(expected);
        done();
      }).catch(e => done(e));
    });

    it("map update of new properties handled correctly", (done: MochaDone) => {
      const initialState = {key1: true, key2: false};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(initialState);
        activity.setState(StringMap.objectToMap({key3: "value", key4: 10}));
        const expected = {...initialState, ...{key3: "value", key4: 10}};
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(expected);
        done();
      }).catch(e => done(e));
    });

    it("object update of new properties handled correctly", (done: MochaDone) => {
      const initialState = {key1: true, key2: false};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(initialState);
        activity.setState({key3: "value", key4: 10});
        const expected = {...initialState, ...{key3: "value", key4: 10}};
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(expected);
        done();
      }).catch(e => done(e));
    });

    it("key-value set of existing property handled correctly", (done: MochaDone) => {
      const initialState = {key1: true, key2: false};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(initialState);
        activity.setState("key1", false);
        const expected = {...initialState, ...{key1: false}};
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(expected);
        done();
      }).catch(e => done(e));
    });

    it("key-value set of property emits ActivityStateSetEvent and ActivityStateDeltaEvent", (done: MochaDone) => {
      const initialState = {key1: true, key2: false};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        const stateSet = new Deferred<void>();
        activity.on(ActivityStateSetEvent.EVENT_NAME, (e: ActivityStateSetEvent) => {
          expect(e.activity).to.equal(activity);
          expect(e.user).to.equal(LOCAL_USER);
          expect(e.sessionId).to.equal(LOCAL_SESSION_ID);
          expect(e.local).to.be.true;
          expect(e.key).to.equal("key1");
          expect(e.value).to.be.false;
          expect(e.oldValue).to.be.true;
          stateSet.resolve();
        });

        const stateDelta = new Deferred<void>();
        activity.on(ActivityStateDeltaEvent.EVENT_NAME, (e: ActivityStateDeltaEvent) => {
          expect(e.activity).to.equal(activity);
          expect(e.user).to.equal(LOCAL_USER);
          expect(e.sessionId).to.equal(LOCAL_SESSION_ID);
          expect(e.local).to.be.true;
          expect(StringMap.mapToObject(e.values)).to.deep.equal({key1: false});
          expect(StringMap.mapToObject(e.oldValues)).to.deep.equal({key1: true});
          expect(e.complete).to.be.false;
          expect(e.removed).to.be.empty;
          stateDelta.resolve();
        });
        activity.setState("key1", false);

        Promise.all([stateSet, stateDelta]).then(() => done());
      }).catch(e => done(e));
    });

    it("set of multiple properties sends correct message", (done: MochaDone) => {
      const initialState = {key1: true, key2: false};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        activity.setState({key3: false, key4: 10});
        assert(connection.sendStub.calledWith({
          activityUpdateState: {
            activityId: ACTIVITY_ID,
            set: {
              key3: {boolValue: false},
              key4: {numberValue: 10}
            },
            complete: false,
            removed: []
          }
        }));
        done();
      }).catch(e => done(e));
    });
  });

  describe("removeState()", () => {
    it("single key handled correctly", (done: MochaDone) => {
      const initialState = {key1: true, key2: false};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(initialState);
        activity.removeState("key1");
        const expected = {...initialState};
        delete expected["key1"];
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(expected);
        done();
      }).catch(e => done(e));
    });

    it("remove array of keys handled properly", (done: MochaDone) => {
      const initialState = {key1: true, key2: false, key3: 10};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(initialState);
        activity.removeState(["key1", "key2"]);
        const expected = {...initialState};
        delete expected["key1"];
        delete expected["key2"];
        expect(StringMap.mapToObject(activity.state())).to.deep.equal(expected);
        done();
      }).catch(e => done(e));
    });

    it("multiple property remove emits ActivityStateSetEvent and ActivityStateDeltaEvent", (done: MochaDone) => {
      const initialState = {key1: true, key2: false, key3: 10};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        const k1 = new Deferred<void>();
        const k2 = new Deferred<void>();
        activity.on(ActivityStateRemovedEvent.EVENT_NAME, (e: ActivityStateRemovedEvent) => {
          expect(e.activity).to.equal(activity);
          expect(e.user).to.equal(LOCAL_USER);
          expect(e.sessionId).to.equal(LOCAL_SESSION_ID);
          expect(e.local).to.be.true;

          if (e.key === "key1") {
            expect(e.oldValue).to.be.true;
            k1.resolve();
          } else if (e.key === "key2") {
            expect(e.oldValue).to.be.false;
            k2.resolve();
          } else {
            expect.fail();
          }
        });

        const delta = new Deferred<void>();
        activity.on(ActivityStateDeltaEvent.EVENT_NAME, (e: ActivityStateDeltaEvent) => {
          expect(e.activity).to.equal(activity);
          expect(e.user).to.equal(LOCAL_USER);
          expect(e.sessionId).to.equal(LOCAL_SESSION_ID);
          expect(e.local).to.be.true;
          expect(e.values).to.be.empty;
          expect(StringMap.mapToObject(e.oldValues)).to.deep.equal({key1: true, key2: false});
          expect(e.complete).to.be.false;
          expect(new Set(e.removed)).to.be.deep.equal(new Set(["key1", "key2"]));
          delta.resolve();
        });
        activity.removeState(["key1", "key2"]);

        return Promise
          .all([k1.promise(), k2.promise(), delta.promise()])
          .then(() => {
            return;
          });
      }).then(done, done);
    });

    it("set of multiple properties sends correct message", (done: MochaDone) => {
      const initialState = {key1: true, key2: false};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        activity.removeState(["key1", "key2"]);
        assert(connection.sendStub.calledWith({
          activityUpdateState: {
            activityId: ACTIVITY_ID,
            set: {},
            complete: false,
            removed: ["key1", "key2"]
          }
        }));
        done();
      }).catch(e => done(e));
    });
  });

  describe("clearState()", () => {
    it("clears local state", (done: MochaDone) => {
      const initialState = {key1: true, key2: false};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        activity.clearState();
        expect(activity.state()).to.be.empty;
      }).then(done, done);
    });

    it("fires correct events", (done: MochaDone) => {
      const initialState = {key1: true, key2: false};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        const clear = new Deferred<void>();
        activity.on(ActivityStateClearedEvent.EVENT_NAME, (e: ActivityStateClearedEvent) => {
          expect(e.activity).to.equal(activity);
          expect(e.user).to.equal(LOCAL_USER);
          expect(e.sessionId).to.equal(LOCAL_SESSION_ID);
          expect(e.local).to.be.true;
          clear.resolve();
        });

        const delta = new Deferred<void>();
        activity.on(ActivityStateDeltaEvent.EVENT_NAME, (e: ActivityStateDeltaEvent) => {
          expect(e.activity).to.equal(activity);
          expect(e.user).to.equal(LOCAL_USER);
          expect(e.sessionId).to.equal(LOCAL_SESSION_ID);
          expect(e.local).to.be.true;
          expect(e.values).to.be.empty;
          expect(StringMap.mapToObject(e.oldValues)).to.deep.equal({key1: true, key2: false});
          expect(e.complete).to.be.true;
          expect(e.removed).to.be.empty;
          delta.resolve();
        });
        activity.clearState();

        return Promise
          .all([clear.promise(), delta.promise()])
          .then(() => undefined);
      }).then(done, done);
    });

    it("sends correct message", (done: MochaDone) => {
      const initialState = {key1: true, key2: false};
      const connection = mockConnection();
      mockJoin(connection, initialState);

      const activity = new Activity(ACTIVITY_ID, IDENTITY_CACHE, connection.connection);
      activity._join();
      activity._whenJoined().then(() => {
        activity.clearState();
        assert(connection.sendStub.calledWith({
          activityUpdateState: {
            activityId: ACTIVITY_ID,
            set: {},
            complete: true,
            removed: []
          }
        }));
      }).then(done, done);
    });
  });
});

function mockJoin(connection: IMockConnection, joinState: any = {}, remoteSessions: any = {}): void {
  const localProtoState = mapObjectValues(joinState, jsonToProtoValue);
  const responseState: any = {...remoteSessions};
  responseState[LOCAL_SESSION_ID] = {
    state: localProtoState
  };
  connection.requestStub
    .withArgs(match.has("activityJoinRequest", match.has("activityId", ACTIVITY_ID)))
    .returns(Promise.resolve({
      activityJoinResponse: {
        state: responseState
      }
    }));
}

interface IMockConnection {
  connection: ConvergenceConnection;
  messageSubject: Subject<MessageEvent>;
  eventSubject: Subject<IConnectionEvent>;
  requestStub: SinonStub;
  sendStub: SinonStub;
}

function mockIdentityCache(users?: Array<{ user: DomainUser, sessionIds: string[] }>): IdentityCache {
  users = users || [];

  const identityCache = createStubInstance(IdentityCache);
  users.forEach(user => {
    (identityCache.getUser as SinonStub)
      .withArgs(match.has("userType", user.user.userType)
        .and(match.has("username", user.user.username))
      ).returns(user.user);

    user.sessionIds.forEach(sessionId => {
      (identityCache.getUserForSession as SinonStub)
        .withArgs(sessionId)
        .returns(user.user);
    });
  });

  return identityCache as any as IdentityCache;
}

function mockConnection(): IMockConnection {
  const connectionStub = createStubInstance(ConvergenceConnection);
  const messageSubject = new Subject<MessageEvent>();
  connectionStub.messages.callsFake(() => messageSubject.asObservable());

  const eventSubject = new Subject<IConnectionEvent>();
  connectionStub.events.callsFake(() => eventSubject.asObservable());

  const domain = createStubInstance(ConvergenceDomain) as any as ConvergenceDomain;
  const connection = connectionStub as any as ConvergenceConnection;

  const session = new ConvergenceSession(domain, connection, LOCAL_USER, LOCAL_SESSION_ID, RECONNECT_TOKEN);

  (connection.session as SinonStub).returns(session);
  (connection.isOnline as SinonStub).returns(true);

  const requestStub = (connection.request as SinonStub);
  const sendStub = (connection.send as SinonStub);

  return {
    connection,
    messageSubject,
    eventSubject,
    requestStub,
    sendStub
  };
}
