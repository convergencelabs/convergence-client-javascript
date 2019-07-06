import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Activity} from "./Activity";
import {IActivityJoinOptions} from "./IActivityJoinOptions";
import {IActivityEvent} from "./events";
import {ConvergenceEventEmitter, ConvergenceLogging, Logger} from "../util/";
import {IdentityCache} from "../identity/IdentityCache";
import {filter, tap} from "rxjs/operators";
import {ActivityLeftEvent} from "./events/ActivityLeftEvent";

/**
 * The [[ActivityService]] provides the main entry point into working with
 * Activities in Convergence. Activities provide a mechanism to communicate
 * `where` users are operating within a system and `what` they are doing.
 */
export class ActivityService extends ConvergenceEventEmitter<IActivityEvent> {

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private readonly _joinedActivities: Map<string, Activity>;

  /**
   * @internal
   */
  private readonly _identityCache: IdentityCache;

  /**
   * @internal
   */
  private readonly _logger: Logger;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection, identityCache: IdentityCache) {
    super();
    this._logger = ConvergenceLogging.logger("activities.service");
    this._connection = connection;
    this._identityCache = identityCache;
    this._joinedActivities = new Map<string, Activity>();
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
   * @returns
   *   A Promise that will be resolved with the successfully joined
   *   [[Activity]].
   */
  public join(id: string, options?: IActivityJoinOptions): Promise<Activity> {
    let activity = this._joinedActivities.get(id);
    if (activity === undefined) {
      activity = new Activity(id, this._identityCache, this._connection);

      this._joinedActivities.set(id, activity);

      // The activity services will consolidate all events from all activities.
      // we tap this to look for the activity left event and remove that activity
      // from the joined activities.
      const activityEvents = activity
        .events()
        .pipe(
          filter((evt: IActivityEvent) => evt.name === ActivityLeftEvent.EVENT_NAME),
          tap((evt: IActivityEvent) => this._onActivityLeave(id))
        );

      activity._join(options);
      activity._whenJoined()
        .then(() => {
          this._emitFrom(activityEvents);
          return Promise.resolve(activity);
        })
        .catch(error => {
          this._joinedActivities.delete(id);
          return Promise.reject(error);
        });
    }

    return activity._whenJoined().then(() => activity);
  }

  /**
   * Provides a map of all currently joined Activities.
   *
   * @returns
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
   * @returns
   *   True if the Activity with the specified id is joined; false otherwise.
   */
  public isJoined(id: string): boolean {
    return this._joinedActivities.has(id);
  }

  /**
   * @hidden
   * @private
   */
  public _setOnline(): void {
    this._logger.debug("Activity service online");
    this._joinedActivities.forEach((activity) => activity._setOnline());
  }

  /**
   * @hidden
   * @private
   */
  public _setOffline(): void {
    this._logger.debug("Activity service offline");
    this._joinedActivities.forEach((activity) => activity._setOffline());
  }

  /**
   * @hidden
   * @internal
   */
  private _onActivityLeave(id: string): void {
    this._joinedActivities.delete(id);
  }
}
