import {IdentityCache} from "../../../main/ts/identity/IdentityCache";
import {
  Activity,
  ActivitySessionJoinedEvent,
  ActivityStateDeltaEvent,
  ActivityStateRemovedEvent,
  ActivityStateSetEvent,
  ConvergenceDomain,
  ConvergenceSession,
  DomainUser,
  DomainUserType
} from "../../../main/ts";
import {createStubInstance, SinonStub, match} from "sinon";
import {ConvergenceConnection, IConnectionEvent, MessageEvent} from "../../../main/ts/connection/ConvergenceConnection";
import {Subject} from "rxjs";
import {expect} from "chai";
import {Deferred} from "../../../main/ts/util/Deferred";

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

describe("Activity", () => {

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

  it("activityStateUpdated for setting state is handled correctly ", (done: MochaDone) => {
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
});

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

function mockJoin(connection: IMockConnection, joinState: any = {}, remoteSessions: any = {}): void {
  const responseState: any = {...remoteSessions};
  responseState[LOCAL_SESSION_ID] = joinState;
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

  const identityCache: IdentityCache = createStubInstance(IdentityCache);
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

  return identityCache;
}

function mockConnection(): IMockConnection {
  const connection: ConvergenceConnection = createStubInstance(ConvergenceConnection);
  const messageSubject = new Subject<MessageEvent>();
  connection.messages = () => messageSubject.asObservable();

  const eventSubject = new Subject<IConnectionEvent>();
  connection.events = () => eventSubject.asObservable();

  const domain = createStubInstance(ConvergenceDomain);

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
