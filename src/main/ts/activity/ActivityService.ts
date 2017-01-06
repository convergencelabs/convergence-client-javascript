import {Session} from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Activity} from "./Activity";
import {MessageType} from "../connection/protocol/MessageType";
import {MessageEvent} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs/Rx";
import {SessionJoinedEvent, SessionLeftEvent, StateClearedEvent, StateSetEvent} from "./events";
import {ActivitySessionJoined} from "../connection/protocol/activity/sessionJoined";
import {ActivitySessionLeft} from "../connection/protocol/activity/sessionLeft";
import {ActivityRemoteStateSet, ActivityRemoteStateCleared} from "../connection/protocol/activity/activityState";
import {SessionIdParser} from "../connection/protocol/SessionIdParser";
import {ActivityParticipant} from "./ActivityParticipant";
import {ActivityJoinRequest} from "../connection/protocol/activity/joinActivity";
import {ActivityJoinResponse} from "../connection/protocol/activity/joinActivity";
import {Deferred} from "../util/Deferred";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ActivityRemoteStateRemoved} from "../connection/protocol/activity/activityState";
import {ActivityEvent} from "./events";
import {StateRemovedEvent} from "./events";
import {mapToObject, objectToMap} from "../util/ObjectUtils";
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

    let messageObs: Observable<MessageEvent> = Observable.create(observer => {
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

    let eventStream: Observable<any> = messageObs.pluck("message").concatMap((message: IncomingActivityMessage) => {
      const activity: Activity = this._joinedActivities.get(message.activityId);
      if (activity === undefined) {
        // todo log this as an error?
        return [];
      }

      switch (message.type) {
        case MessageType.ACTIVITY_SESSION_JOINED:
          const joinedMsg: ActivitySessionJoined = <ActivitySessionJoined> message;
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
          const leftMsg: ActivitySessionLeft = <ActivitySessionLeft> message;
          return [new SessionLeftEvent(
            activity,
            SessionIdParser.parseUsername(leftMsg.sessionId),
            leftMsg.sessionId,
            false
        )];
        case MessageType.ACTIVITY_REMOTE_STATE_SET:
          const stateSetMsg: ActivityRemoteStateSet = <ActivityRemoteStateSet> message;
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
          const stateClearedMsg: ActivityRemoteStateCleared = <ActivityRemoteStateCleared> message;
          return [new StateClearedEvent(
            activity,
            SessionIdParser.parseUsername(stateClearedMsg.sessionId),
            stateClearedMsg.sessionId,
            false
        )];
        case MessageType.ACTIVITY_REMOTE_STATE_REMOVED:
          const stateRemovedMsg: ActivityRemoteStateRemoved = <ActivityRemoteStateRemoved> message;
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
      if (options === undefined) {
        options = <ActivityJoinOptions> {
          state: new Map<string, any>()
        };
      }
      let deferred: Deferred<Activity> = new Deferred<Activity>();
      this._joinedDeferreds.set(id, deferred);
      this._connection.request(<ActivityJoinRequest> {
        type: MessageType.ACTIVITY_JOIN_REQUEST,
        activityId: id,
        state: options.state
      }).then((response: ActivityJoinResponse) => {
        const participants: Map<string, ActivityParticipant> = new Map<string, ActivityParticipant>();

        Object.keys(response.participants).forEach(sessionId => {
          const username: string = SessionIdParser.parseUsername(sessionId);
          const local: boolean = sessionId === this._connection.session().sessionId();
          const state: { [key: string]: any } = response.participants[sessionId];
          let stateMap: Map<string, any> = objectToMap(state);
          const participant = new ActivityParticipant(sessionId, username, stateMap, local);
          participants.set(sessionId, participant);
        });

        const filteredEvents: Observable<ActivityEvent> = this.events().filter(event => {
          return event.activity.id() === id;
        });

        const activity: Activity = new Activity(
          id,
          participants,
          this._leftCB(id).bind(this),
          filteredEvents,
          this._connection);

        deferred.resolve(activity);
        this._joinedActivities.set(id, activity);
      });
    }

    // TODO: validate that this works
    return this._joinedDeferreds.get(id).promise();
  }

  public joined(): { [key: string]: Activity } {
    return mapToObject(this._joinedDeferreds);
  }

  public isJoined(id: string): boolean {
    return this._joinedDeferreds.has(id);
  }

  private _leftCB: (id: string) => () => void = (id: string) => {
    return () => {
      this._joinedDeferreds.delete(id);
      this._joinedActivities.delete(id);
    };
  }
}

export interface ActivityJoinOptions {
  state?: Map<string, any> | {[key: string]: any};
}
