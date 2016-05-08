import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {Activity} from "./Activity";
import {ActivityState} from "../connection/protocol/activity/openActivity";
import {IncomingProtocolNormalMessage} from "../connection/protocol/protocol";
import MessageType from "../connection/protocol/MessageType";
import {ActivityRemoteStateSet} from "../connection/protocol/activity/activityState";
import {ActivityRemoteStateCleared} from "../connection/protocol/activity/activityState";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ActivityClearState} from "../connection/protocol/activity/activityState";
import ConvergenceConnection from "../connection/ConvergenceConnection";
import {ActivitySetState} from "../connection/protocol/activity/activityState";


export class ActivityStateMap extends ConvergenceEventEmitter {

  static Events: any = {
    REMOTE_STATE_SET: "remote_state_set",
    REMOTE_STATE_CLEARED: "remote_state_cleared"
  };

  private _connection: ConvergenceConnection;
  private _activity: Activity;
  private _state: ActivityState;

  constructor(connection: ConvergenceConnection,
              activity: Activity,
              state: ActivityState) {
    this._connection = connection;
    this._activity = activity;
    this._state = state;
    this._state[activity.session().sessionId()] = {};
  }

  activity(): Activity {
    return this._activity;
  }

  set(key: string, value: any): void {
    this._state[this._activity.session().sessionId()][key] = value;
    var message: ActivitySetState = {
      key: key,
      value: value
    };
    this._connection.send(message);
  }

  setAll(values: {[key: string]: any}): void {
    Object.keys(values).forEach(key => {
      this.set(key, values[key]);
    });
  }

  get(key: string): any
  get(key: string, sessionId: string): any {
    if (arguments.length === 1) {
      sessionId = this._activity.session().sessionId();
    }
    var sessionState: {[key: string]: any} = this._state[sessionId];
    if (sessionState !== undefined) {
      return sessionState[key];
    } else {
      return;
    }
  }

  getByKey(key: string, includeLocal?: boolean = true): {[key: string]: any} {
    var result: {[key: string]: any} = {};
    Object.keys(this._state).forEach(sessionId => {
      if (includeLocal || sessionId !== this._activity.session().sessionId()) {
        result[sessionId] = this._state[sessionId][key];
      }
    });
    return result;
  }

  getBySession(sessionId: string): {[key: string]: any} {
    // todo clone
    return this._state[sessionId];
  }

  remove(key: string): void {
    delete this._state[this._activity.session().sessionId()][key];
    var message: ActivityClearState = {
      key: key
    };
    this._connection.send(message);
  }

  removeAll(): void {
    Object.keys(this._state[this._activity.session().sessionId()]).forEach(key => {
      this.remove(key);
    });
  }

  _handleMessage(message: IncomingProtocolNormalMessage): void {
    switch (message.type) {
      case MessageType.ACTIVITY_STATE_SET:
        this._onRemoteStateSet(<ActivityRemoteStateSet>message);
        break;
      case MessageType.ACTIVITY_STATE_CLEARED:
        this._onRemoteStateCleared(<ActivityRemoteStateCleared>message);
        break;
      default:
      // todo error
    }
  }

  private _onRemoteStateSet(message: ActivityRemoteStateSet): void {
    var event: ActivityRemoteStateSetEvent = {
      src: this,
      name: ActivityStateMap.Events.REMOTE_STATE_SET,
      userId: message.userId,
      sessionId: message.sessionId,
      key: message.key,
      value: message.value
    };
    this.emitEvent(event);
  }

  private _onRemoteStateCleared(message: ActivityRemoteStateCleared): void {
    var event: ActivityRemoteStateClearedEvent = {
      src: this,
      name: ActivityStateMap.Events.REMOTE_STATE_CLEARED,
      userId: message.userId,
      sessionId: message.sessionId,
      key: message.key
    };
    this.emitEvent(event);
  }
}

export interface ActivityRemoteStateSetEvent extends ConvergenceEvent {
  userId: string;
  sessionId: string;
  key: string;
  value: any;
}

export interface ActivityRemoteStateClearedEvent extends ConvergenceEvent {
  userId: string;
  sessionId: string;
  key: string;
}
