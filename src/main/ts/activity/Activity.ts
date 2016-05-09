import Session from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {RemoteSession} from "../RemoteSession";
import {ActivityStateMap} from "./ActivityStateMap";
import Deferred from "../util/Deferred";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import MessageType from "../connection/protocol/MessageType";
import {IncomingProtocolMessage} from "../connection/protocol/protocol";
import {ActivitySessionJoined} from "../connection/protocol/activity/sessionJoined";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ActivitySessionLeft} from "../connection/protocol/activity/sessionLeft";
import {ActivityState} from "../connection/protocol/activity/openActivity";
import {ActivityJoinRequest} from "../connection/protocol/activity/joinActivity";
import {ActivityJoinResponse} from "../connection/protocol/activity/joinActivity";
import {ActivityLeaveRequest} from "../connection/protocol/activity/leaveActivity";
import {ActivityLeaveResponse} from "../connection/protocol/activity/leaveActivity";
import {ActivityCloseRequest} from "../connection/protocol/activity/closeActivity";
import {SessionIdParser} from "../connection/protocol/SessionIdParser";
import {MessageEvent} from "../connection/ConvergenceConnection";

export class Activity extends ConvergenceEventEmitter {

  static Events: any = {
    USER_JOINED: "user_joined",
    USER_LEFT: "user_joined",
    SESSION_JOINED: "session_joined",
    SESSION_LEFT: "session_joined"
  };

  private _id: string;

  private _joinedSessionsByUserId: {[key: string]: RemoteSession[]};
  private _stateMap: ActivityStateMap;

  private _connection: ConvergenceConnection;

  private _joiningDeferred: Deferred<void>;
  private _joined: boolean;
  private _closeCallback: (id: string) => void;

  constructor(connection: ConvergenceConnection,
              joinedSessionsByUserId: {[key: string]: RemoteSession[]},
              stateMap: ActivityState,
              id: string,
              closeCallback: (id: string) => void) {
    super();
    this._connection = connection;
    this._id = id;
    this._closeCallback = closeCallback;
    this._joiningDeferred = null;
    this._joined = false;
    this._joinedSessionsByUserId = joinedSessionsByUserId;
    this._stateMap = new ActivityStateMap(
      connection,
      this,
      stateMap);
  }

  session(): Session {
    return this._connection.session();
  }

  id(): string {
    return this._id;
  }

  join(): Promise<void> {
    if (this.joined()) {
      return Promise.resolve(null);
    } else if (this._joiningDeferred !== null) {
      return this._joiningDeferred.promise();
    } else {
      var deferred: Deferred<void> = new Deferred<void>();
      var joinRequest: ActivityJoinRequest = {
        activityId: this._id
      };

      this._connection.request(joinRequest).then((response: ActivityJoinResponse) => {
        this._joined = true;
        deferred.resolve();
      }).catch((error: Error) => {
        deferred.reject(error);
      });
      this._joiningDeferred = deferred;
      return deferred.promise();
    }
  }

  leave(): Promise<void> {
    var leaveRequest: ActivityLeaveRequest = {
      activityId: this._id
    };
    var deferred: Deferred<void> = new Deferred<void>();
    this._connection.request(leaveRequest).then((response: ActivityLeaveResponse) => {
      deferred.resolve();
    }).catch((error: Error) => {
      deferred.reject(error);
    });
    return deferred.promise();
  }

  joined(): boolean {
    return this._joined;
  }

  joinedSessions(): RemoteSession[] {
    var result: RemoteSession[] = [];
    Object.keys(this._joinedSessionsByUserId).forEach(userId => {
      var sessions: RemoteSession[] = this._joinedSessionsByUserId[userId];
      sessions.forEach(session => {
        result.push(session);
      });
    });
    return result;
  }

  joinedSessionsByUserId(): {[key: string]: RemoteSession[]} {
    var result: {[key: string]: RemoteSession[]} = {};
    Object.keys(this._joinedSessionsByUserId).forEach(userId => {
      var sessions: RemoteSession[] = [];
      result[userId] = sessions;
      this._joinedSessionsByUserId[userId].forEach(session => {
        sessions.push(session);
      });
    });
    return result;
  }

  close(): void {
    var message: ActivityCloseRequest = {
      activityId: this._id
    };

    this._connection.request(message);
    this._closeCallback(this._id);
  }

  stateMap(): ActivityStateMap {
    return this._stateMap;
  }

  _handleMessage(messageEvent: MessageEvent): void {
    var message: IncomingProtocolMessage = messageEvent.message;

    switch (message.type) {
      case MessageType.ACTIVITY_SESSION_JOINED:
        this._sessionJoined(<ActivitySessionJoined>message);
        break;
      case MessageType.ACTIVITY_SESSION_LEFT:
        this._sessionLeft(<ActivitySessionLeft>message);
        break;
      case MessageType.ACTIVITY_REMOTE_STATE_SET:
      case MessageType.ACTIVITY_REMOTE_STATE_CLEARED:
        this._stateMap._handleMessage(message);
        break;
      default:
      // fixme error
    }
  }

  private _sessionJoined(message: ActivitySessionJoined): void {
    var userId: string = SessionIdParser.parseUserId(message.sessionId);
    var sessionId: string = message.sessionId;
    var fireUserEvent: boolean = false;
    var userSessions: RemoteSession[] = this._joinedSessionsByUserId[userId];
    if (userSessions === undefined) {
      fireUserEvent = true;
      userSessions = [];
      this._joinedSessionsByUserId[userId] = userSessions;
    }

    userSessions.push({userId: userId, sessionId: sessionId});

    if (fireUserEvent) {
      var userEvent: ActivityUserJoinedEvent = {
        src: this,
        name: Activity.Events.USER_JOINED,
        activityId: this._id,
        userId: userId,
        sessionId: sessionId
      };
      this.emitEvent(userEvent);
    }

    var sessionEvent: ActivitySessionJoinedEvent = {
      src: this,
      name: Activity.Events.SESSION_JOINED,
      activityId: this._id,
      userId: userId,
      sessionId: sessionId
    };
    this.emitEvent(sessionEvent);
  }

  private _sessionLeft(message: ActivitySessionLeft): void {
    var userId: string = SessionIdParser.parseUserId(message.sessionId);
    var sessionId: string = message.sessionId;
    var fireUserEvent: boolean = false;
    var userSessions: RemoteSession[] = this._joinedSessionsByUserId[userId];
    userSessions.forEach((session: RemoteSession) => {
      if (session.sessionId === sessionId) {
        userSessions.splice(userSessions.indexOf(session), 1);
      }
    });

    if (userSessions.length === 0) {
      fireUserEvent = true;
      delete this._joinedSessionsByUserId[userId];
    }

    if (fireUserEvent) {
      var userEvent: ActivityUserLeftEvent = {
        src: this,
        name: Activity.Events.USER_LEFT,
        activityId: this._id,
        userId: userId,
        sessionId: sessionId
      };
      this.emitEvent(userEvent);
    }

    var sessionEvent: ActivitySessionLeftEvent = {
      src: this,
      name: Activity.Events.SESSION_LEFT,
      activityId: this._id,
      userId: userId,
      sessionId: sessionId
    };
    this.emitEvent(sessionEvent);
  }
}

export interface ActivityUserJoinedEvent extends ConvergenceEvent {
  activityId: string;
  userId: string;
  sessionId: string;
}

export interface ActivityUserLeftEvent extends ConvergenceEvent {
  activityId: string;
  userId: string;
  sessionId: string;
}

export interface ActivitySessionJoinedEvent extends ConvergenceEvent {
  activityId: string;
  userId: string;
  sessionId: string;
}

export interface ActivitySessionLeftEvent extends ConvergenceEvent {
  activityId: string;
  userId: string;
  sessionId: string;
}
