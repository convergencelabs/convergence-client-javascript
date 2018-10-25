import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {Activity} from "./Activity";
import {ActivityParticipant} from "./ActivityParticipant";
import {IActivityJoinOptions} from "./IActivityJoinOptions";
import {Observable, Observer} from "rxjs/Rx";
import {
  IActivityEvent,
  ActivitySessionJoinedEvent,
  ActivitySessionLeftEvent,
  ActivityStateClearedEvent,
  ActivityStateRemovedEvent,
  ActivityStateSetEvent
} from "./events";
import {MessageType} from "../connection/protocol/MessageType";
import {ActivitySessionJoined} from "../connection/protocol/activity/sessionJoined";
import {ActivitySessionLeft} from "../connection/protocol/activity/sessionLeft";
import {
  ActivityRemoteStateCleared,
  ActivityRemoteStateRemoved,
  ActivityRemoteStateSet
} from "../connection/protocol/activity/activityState";
import {IncomingActivityMessage} from "../connection/protocol/activity/incomingActivityMessage";
import {SessionIdParser} from "../connection/protocol/SessionIdParser";
import {ActivityJoinRequest, ActivityJoinResponse} from "../connection/protocol/activity/joinActivity";
import {Deferred} from "../util/Deferred";
import {ConvergenceEventEmitter, StringMap} from "../util/";

/**
 * The ActivityService provides the main entry point into working with
 * Activities in Convergence. Activities provide a mechanism to communicate
 * `where` users are operating within a system and what they are doing.
 */
export class ActivityService extends ConvergenceEventEmitter<IActivityEvent> {

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private readonly _joinedDeferreds: Map<string, Deferred<Activity>>;

  /**
   * @internal
   */
  private readonly _joinedActivities: Map<string, Activity>;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection) {
    super();
    this._connection = connection;
    this._joinedDeferreds = new Map<string, Deferred<Activity>>();
    this._joinedActivities = new Map<string, Activity>();

    const messageObs: Observable<MessageEvent> = Observable.create((observer: Observer<MessageEvent>) => {
      this._connection
        .messages(
          [MessageType.ACTIVITY_SESSION_JOINED,
            MessageType.ACTIVITY_SESSION_LEFT,
            MessageType.ACTIVITY_REMOTE_STATE_SET,
            MessageType.ACTIVITY_REMOTE_STATE_REMOVED,
            MessageType.ACTIVITY_REMOTE_STATE_CLEARED])
        .subscribe(event => observer.next(event));
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
            activity,
            joinedMsg.sessionId,
            username,
            false,
            joinedMsg.state);
          return [new ActivitySessionJoinedEvent(
            activity,
            username,
            joinedMsg.sessionId,
            false,
            participant)];
        case MessageType.ACTIVITY_SESSION_LEFT:
          const leftMsg: ActivitySessionLeft = message as ActivitySessionLeft;
          return [new ActivitySessionLeftEvent(
            activity,
            SessionIdParser.parseUsername(leftMsg.sessionId),
            leftMsg.sessionId,
            false
          )];
        case MessageType.ACTIVITY_REMOTE_STATE_SET:
          const stateSetMsg: ActivityRemoteStateSet = message as ActivityRemoteStateSet;
          return Object.keys(stateSetMsg.state).map(key => {
            return new ActivityStateSetEvent(
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
          return [new ActivityStateClearedEvent(
            activity,
            SessionIdParser.parseUsername(stateClearedMsg.sessionId),
            stateClearedMsg.sessionId,
            false
          )];
        case MessageType.ACTIVITY_REMOTE_STATE_REMOVED:
          const stateRemovedMsg: ActivityRemoteStateRemoved = message as ActivityRemoteStateRemoved;
          return stateRemovedMsg.keys.map(key => {
            return new ActivityStateRemovedEvent(
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

  /**
   * @returns
   *   The current Convergence ConvergenceSession object that represents the connection
   *   to the Convergence Domain.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * Allows the connected user to join the specified activity.
   *
   * ```typescript
   * const activityId = "myActivityId";
   * activityService
   *   .join(activityId)
   *   .then(activity => {
   *     console.log("Joined!");
   *     console.log(activity.participants());
   *   });
   *   .catch(e => console.error(e));
   * ```
   *
   * @param id
   *   The unique id of the Activity to join.
   * @param options
   *   Options for connecting to the specified Activity.
   *
   * @return
   *   A Promise that will be resolved with the successfully joined
   *   [[Activity]].
   */
  public join(id: string, options?: IActivityJoinOptions): Promise<Activity> {
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
          const filteredEvents: Observable<IActivityEvent> = this.events().filter(event => {
            return event.activity.id() === id;
          });

          const activity: Activity = new Activity(
            id,
            new Map(),
            () => this._onActivityLeave(id),
            filteredEvents,
            this._connection);

          const participants: Map<string, ActivityParticipant> = new Map<string, ActivityParticipant>();
          Object.keys(response.participants).forEach(sessionId => {
            const username: string = SessionIdParser.parseUsername(sessionId);
            const local: boolean = sessionId === this._connection.session().sessionId();
            const state: { [key: string]: any } = response.participants[sessionId];
            const stateMap: Map<string, any> = StringMap.objectToMap(state);
            const participant = new ActivityParticipant(activity, sessionId, username, local, stateMap);
            participants.set(sessionId, participant);
          });

          activity._setParticipants(participants);

          deferred.resolve(activity);
          this._joinedActivities.set(id, activity);
        })
        .catch(e => {
          deferred.reject(e);
        });
    }

    return this._joinedDeferreds.get(id).promise();
  }

  /**
   * Provides a map of all currently joined Activities.
   *
   * @return
   *   A Map of Activity Id => Activity.
   */
  public joined(): Map<string, Activity> {
    return new Map(this._joinedActivities);
  }

  /**
   * Determines if an Activity with the specified id is already joined.
   *
   * @param id
   *   The id of the Activity to check.
   * @return
   *   True if the Activity with the specified id is joined; false otherwise.
   */
  public isJoined(id: string): boolean {
    return this._joinedDeferreds.has(id);
  }

  /**
   * @hidden
   * @internal
   */
  private _onActivityLeave(id: string): void {
    this._joinedDeferreds.delete(id);
    this._joinedActivities.delete(id);
  }
}
