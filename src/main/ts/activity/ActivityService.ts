import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {Activity} from "./Activity";
import {ActivityParticipant} from "./ActivityParticipant";
import {IActivityJoinOptions} from "./IActivityJoinOptions";
import {Observable} from "rxjs";
import {concatMap, filter} from "rxjs/operators";
import {
  IActivityEvent,
  ActivitySessionJoinedEvent,
  ActivitySessionLeftEvent,
  ActivityStateClearedEvent,
  ActivityStateRemovedEvent,
  ActivityStateSetEvent
} from "./events";
import {Deferred} from "../util/Deferred";
import {ConvergenceEventEmitter, StringMap} from "../util/";
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {IdentityCache} from "../identity/IdentityCache";
import {getOrDefaultObject, jsonToProtoValue, protoValueToJson} from "../connection/ProtocolUtil";
import {mapObjectValues, objectForEach} from "../util/ObjectUtils";

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
   * @internal
   */
  private readonly _identityCache: IdentityCache;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection, identityCache: IdentityCache) {
    super();
    this._connection = connection;
    this._identityCache = identityCache;
    this._joinedDeferreds = new Map<string, Deferred<Activity>>();
    this._joinedActivities = new Map<string, Activity>();

    const eventStream = this._connection.messages().pipe(
      concatMap((event: MessageEvent) => {
        const message = event.message;

        if (message.activitySessionJoined) {
          const joined = message.activitySessionJoined;
          const activity: Activity = this._joinedActivities.get(joined.activityId);
          const user = this._identityCache.getUserForSession(joined.sessionId);
          const state = mapObjectValues(getOrDefaultObject(joined.state), protoValueToJson);
          const participant: ActivityParticipant = new ActivityParticipant(
            activity,
            user,
            joined.sessionId,
            false,
            StringMap.objectToMap(state));
          return [new ActivitySessionJoinedEvent(
            activity,
            user,
            joined.sessionId,
            false,
            participant)];
        } else if (message.activitySessionLeft) {
          const left = message.activitySessionLeft;
          const activity: Activity = this._joinedActivities.get(left.activityId);
          const user = this._identityCache.getUserForSession(left.sessionId);
          return [new ActivitySessionLeftEvent(
            activity,
            user,
            left.sessionId,
            false
          )];
        } else if (message.activityRemoteStateSet) {
          const remoteStateSet = message.activityRemoteStateSet;
          const activity: Activity = this._joinedActivities.get(remoteStateSet.activityId);
          const user = this._identityCache.getUserForSession(remoteStateSet.sessionId);
          const stateSet = getOrDefaultObject(remoteStateSet.state);
          return Object.keys(stateSet).map(key => {
            const value = protoValueToJson(stateSet[key]);
            return new ActivityStateSetEvent(
              activity,
              user,
              remoteStateSet.sessionId,
              false,
              key,
              value
            );
          });
        } else if (message.activityRemoteStateCleared) {
          const remoteStateCleared = message.activityRemoteStateCleared;
          const activity: Activity = this._joinedActivities.get(remoteStateCleared.activityId);
          const user = this._identityCache.getUserForSession(remoteStateCleared.sessionId);
          return [new ActivityStateClearedEvent(
            activity,
            user,
            remoteStateCleared.sessionId,
            false
          )];
        } else if (message.activityRemoteStateRemoved) {
          const remoteStateRemoved = message.activityRemoteStateRemoved;
          const activity: Activity = this._joinedActivities.get(remoteStateRemoved.activityId);
          const user = this._identityCache.getUserForSession(remoteStateRemoved.sessionId);
          return remoteStateRemoved.keys.map(key => {
            return new ActivityStateRemovedEvent(
              activity,
              user,
              remoteStateRemoved.sessionId,
              false,
              key
            );
          });
        } else {
          return [];
        }
      }));

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
      const mappedState = mapObjectValues(StringMap.mapToObject(initialState), jsonToProtoValue);
      const message: IConvergenceMessage = {
        activityJoinRequest: {
          activityId: id,
          state: mappedState
        }
      };

      this._connection.request(message)
        .then((response: IConvergenceMessage) => {
          const joinResponse = response.activityJoinResponse;
          const filteredEvents: Observable<IActivityEvent> = this.events().pipe(filter(event => {
            return event.activity.id() === id;
          }));

          const activity: Activity = new Activity(
            id,
            new Map(),
            () => this._onActivityLeave(id),
            filteredEvents,
            this._connection);

          const participants: Map<string, ActivityParticipant> = new Map<string, ActivityParticipant>();
          const responseState = getOrDefaultObject(joinResponse.state);
          objectForEach(responseState, (sessionId) => {
            const activityState = joinResponse.state[sessionId];
            const user = this._identityCache.getUserForSession(sessionId);
            const local: boolean = sessionId === this._connection.session().sessionId();
            const rawState = getOrDefaultObject(activityState.state);
            const jsonState = mapObjectValues(rawState, protoValueToJson);
            const stateMap: Map<string, any> = StringMap.objectToMap(jsonState);
            const participant = new ActivityParticipant(activity, user, sessionId, local, stateMap);
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
