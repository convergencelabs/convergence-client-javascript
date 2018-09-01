import {Session} from "../Session";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {Activity} from "./Activity";
import {MessageType} from "../connection/protocol/MessageType";
import {Observable, Observer} from "rxjs/Rx";
import {
  SessionJoinedEvent,
  SessionLeftEvent,
  StateClearedEvent,
  StateSetEvent,
  ActivityEvent,
  StateRemovedEvent
} from "./events";
import {ActivitySessionJoined} from "../connection/protocol/activity/sessionJoined";
import {ActivitySessionLeft} from "../connection/protocol/activity/sessionLeft";
import {
  ActivityRemoteStateSet,
  ActivityRemoteStateCleared,
  ActivityRemoteStateRemoved
} from "../connection/protocol/activity/activityState";
import {SessionIdParser} from "../connection/protocol/SessionIdParser";
import {ActivityParticipant} from "./ActivityParticipant";
import {ActivityJoinRequest, ActivityJoinResponse} from "../connection/protocol/activity/joinActivity";
import {Deferred} from "../util/Deferred";
import {ConvergenceEventEmitter, StringMap, StringMapLike} from "../util/";
import {deepClone} from "../util/ObjectUtils";
import {IncomingActivityMessage} from "../connection/protocol/activity/incomingActivityMessage";

export class ActivityService extends ConvergenceEventEmitter<ActivityEvent> {

  private _connection: ConvergenceConnection;
  private _joinedDeferreds: Map<string, Deferred<Activity>>;
  private _joinedActivities: Map<string, Activity>;

  constructor(connection: ConvergenceConnection) {
    super();
    this._connection = connection;
    this._joinedDeferreds = new Map<string, Deferred<Activity>>();
    this._joinedActivities = new Map<string, Activity>();

    const messageObs: Observable<MessageEvent> = Observable.create((observer: Observer<MessageEvent>) => {
      this._connection.addMultipleMessageListener(
        [MessageType.ACTIVITY_SESSION_JOINED,
          MessageType.ACTIVITY_SESSION_LEFT,
          MessageType.ACTIVITY_REMOTE_STATE_SET,
          MessageType.ACTIVITY_REMOTE_STATE_REMOVED,
          MessageType.ACTIVITY_REMOTE_STATE_CLEARED],
        (event) => {
          observer.next(event);
        });
    });

    const eventStream: Observable<any> = messageObs.pluck("message").concatMap((message: IncomingActivityMessage) => {
      const activity: Activity = this._joinedActivities.get(message.activityId);
      if (activity === undefined) {
        // todo log this as an error?
        return [];
      }

      switch (message.type) {
        case MessageType.ACTIVITY_SESSION_JOINED:
          const joinedMsg: ActivitySessionJoined = message as ActivitySessionJoined;
          const username: string = SessionIdParser.parseUsername(joinedMsg.sessionId);
          const participant: ActivityParticipant = new ActivityParticipant(
            joinedMsg.sessionId,
            username,
            joinedMsg.state,
            false);
          return [new SessionJoinedEvent(
            activity,
            username,
            joinedMsg.sessionId,
            false,
            participant)];
        case MessageType.ACTIVITY_SESSION_LEFT:
          const leftMsg: ActivitySessionLeft = message as ActivitySessionLeft;
          return [new SessionLeftEvent(
            activity,
            SessionIdParser.parseUsername(leftMsg.sessionId),
            leftMsg.sessionId,
            false
          )];
        case MessageType.ACTIVITY_REMOTE_STATE_SET:
          const stateSetMsg: ActivityRemoteStateSet = message as ActivityRemoteStateSet;
          return Object.keys(stateSetMsg.state).map(key => {
            return new StateSetEvent(
              activity,
              SessionIdParser.parseUsername(stateSetMsg.sessionId),
              stateSetMsg.sessionId,
              false,
              key,
              stateSetMsg.state[key],
            );
          });
        case MessageType.ACTIVITY_REMOTE_STATE_CLEARED:
          const stateClearedMsg: ActivityRemoteStateCleared = message as ActivityRemoteStateCleared;
          return [new StateClearedEvent(
            activity,
            SessionIdParser.parseUsername(stateClearedMsg.sessionId),
            stateClearedMsg.sessionId,
            false
          )];
        case MessageType.ACTIVITY_REMOTE_STATE_REMOVED:
          const stateRemovedMsg: ActivityRemoteStateRemoved = message as ActivityRemoteStateRemoved;
          return stateRemovedMsg.keys.map(key => {
            return new StateRemovedEvent(
              activity,
              SessionIdParser.parseUsername(stateRemovedMsg.sessionId),
              stateRemovedMsg.sessionId,
              false,
              key
            );
          });
        default:
          // This should be impossible
          throw new Error("Invalid activity event");
      }
    });

    this._emitFrom(eventStream);
  }

  public session(): Session {
    return this._connection.session();
  }

  public join(id: string, options?: ActivityJoinOptions): Promise<Activity> {
    if (!this.isJoined(id)) {
      options = options || {};

      const initialState: Map<string, any> = options.state ?
        StringMap.coerceToMap(options.state) :
        new Map<string, any>();

      const deferred: Deferred<Activity> = new Deferred<Activity>();
      this._joinedDeferreds.set(id, deferred);
      const message: ActivityJoinRequest = {
        type: MessageType.ACTIVITY_JOIN_REQUEST,
        activityId: id,
        state: initialState
      };

      this._connection.request(message)
        .then((response: ActivityJoinResponse) => {
          const participants: Map<string, ActivityParticipant> = new Map<string, ActivityParticipant>();

          Object.keys(response.participants).forEach(sessionId => {
            const username: string = SessionIdParser.parseUsername(sessionId);
            const local: boolean = sessionId === this._connection.session().sessionId();
            const state: { [key: string]: any } = response.participants[sessionId];
            const stateMap: Map<string, any> = StringMap.objectToMap(state);
            const participant = new ActivityParticipant(sessionId, username, stateMap, local);
            participants.set(sessionId, participant);
          });

          const filteredEvents: Observable<ActivityEvent> = this.events().filter(event => {
            return event.activity.id() === id;
          });

          const activity: Activity = new Activity(
            id,
            participants,
            () => this._onActivityLeave(id),
            filteredEvents,
            this._connection);

          deferred.resolve(activity);
          this._joinedActivities.set(id, activity);
        })
        .catch(e => {
          deferred.reject(e);
        });
    }

    return this._joinedDeferreds.get(id).promise();
  }

  public joined(): Map<string, Activity> {
    return new Map(this._joinedActivities);
  }

  public isJoined(id: string): boolean {
    return this._joinedDeferreds.has(id);
  }

  private _onActivityLeave(id: string): void {
    this._joinedDeferreds.delete(id);
    this._joinedActivities.delete(id);
  }
}

export interface ActivityJoinOptions {
  state?: StringMapLike;
}
