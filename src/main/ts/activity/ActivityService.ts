import Session from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Activity} from "./Activity";
import Deferred from "../util/Deferred";
import MessageType from "../connection/protocol/MessageType";
import {ActivityOpenRequest} from "../connection/protocol/activity/openActivity";
import {ActivityOpenResponse} from "../connection/protocol/activity/openActivity";
import {RemoteSession} from "../RemoteSession";
import {SessionIdParser} from "../connection/protocol/SessionIdParser";
import {SessionKey} from "../connection/protocol/SessionIdParser";
import {MessageEvent} from "../connection/ConvergenceConnection";

export class ActivityService {

  private _connection: ConvergenceConnection;
  private _opened: {[key: string]: Activity};
  private _opening: {[key: string]: Deferred<Activity>};

  constructor(connection: ConvergenceConnection) {
    this._connection = connection;
    this._opened = {};
    this._opening = {};

    this._connection.addMultipleMessageListener(
      [MessageType.ACTIVITY_SESSION_JOINED,
        MessageType.ACTIVITY_SESSION_LEFT,
        MessageType.ACTIVITY_REMOTE_STATE_SET,
        MessageType.ACTIVITY_REMOTE_STATE_CLEARED],
      (message: MessageEvent) => this._handleMessage(message));
  }

  session(): Session {
    return this._connection.session();
  }

  open(id: string): Promise<Activity> {
    if (this._opened[id] !== undefined) {
      return Promise.resolve(this._opened[id]);
    } else if (this._opening[id] !== undefined) {
      return this._opening[id].promise();
    } else {
      var deferred: Deferred<Activity> = this._loadActivity(id);
      this._opening[id] = deferred;
      return deferred.promise();
    }
  }

  opened(): {[key: string]: Activity} {
    var cloned: {[key: string]: Activity} = {};
    Object.keys(this._opened).forEach(id => {
      cloned[id] = this._opened[id];
    });
    return cloned;
  }

  isOpen(id: string): boolean {
    return this._opened[id] !== undefined;
  }

  joined(): {[key: string]: Activity} {
    var cloned: {[key: string]: Activity} = {};
    Object.keys(this._opened).forEach(id => {
      if (this._opened[id].joined()) {
        cloned[id] = this._opened[id];
      }
    });
    return cloned;
  }

  isJoined(id: string): boolean {
    return this.isOpen(id) && this._opened[id].joined();
  }

  private _close(id: string): void {
    delete this._opened[id];
  }

  private _loadActivity(id: string): Deferred<Activity> {
    var deferred: Deferred<Activity> = new Deferred<Activity>();

    var openActivityMessage: ActivityOpenRequest = {
      type: MessageType.ACTIVITY_OPEN_REQUEST,
      activityId: id
    };

    this._connection.request(openActivityMessage).then((response: ActivityOpenResponse) => {
      var joinedSessionsByUserId: {[key: string]: RemoteSession[]} = {};
      Object.keys(response.state).forEach((sessionId: string) => {
        var sk: SessionKey = SessionIdParser.deserialize(sessionId);
        var userSessions: RemoteSession[] = joinedSessionsByUserId[sk.userId];
        if (userSessions === undefined) {
          userSessions = [];
          joinedSessionsByUserId[sk.userId] = userSessions;
        }
        userSessions.push({userId: sk.userId, sessionId: sk.sessionId});
      });
      var activity: Activity = new Activity(
        this._connection,
        joinedSessionsByUserId,
        response.state,
        id,
        () => {
          this._close(id);
        });
      this._opened[id] = activity;
      delete this._opening[id];
      deferred.resolve(activity);
    }).catch((error: Error) => {
      deferred.reject(error);
    });
    return deferred;
  }

  _handleMessage(messageEvent: MessageEvent): void {
    var activity: Activity = this._opened[messageEvent.message.activityId];
    if (activity !== undefined) {
      activity._handleMessage(messageEvent);
    } else {
      // todo error.
    }
  }
}
