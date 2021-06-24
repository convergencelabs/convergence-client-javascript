/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Activity} from "./Activity";
import {IActivityJoinOptions} from "./IActivityJoinOptions";
import {IActivityEvent} from "./events";
import {ConvergenceEventEmitter} from "../util";
import {IdentityCache} from "../identity/IdentityCache";
import {filter, tap} from "rxjs/operators";
import {ActivityLeftEvent} from "./events/ActivityLeftEvent";
import {Logger} from "../util/log/Logger";
import {Logging} from "../util/log/Logging";
import {IActivityCreateOptions} from "./IActivityCreateOptions";
import {Validation} from "../util/Validation";
import {com} from "@convergence/convergence-proto";
import IActivityCreateRequestMessage = com.convergencelabs.convergence.proto.activity.IActivityCreateRequestMessage;
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IActivityDeleteRequestMessage = com.convergencelabs.convergence.proto.activity.IActivityDeleteRequestMessage;
import {ActivityPermissionUtils} from "./ActivityPermissionUtils";

/**
 * The [[ActivityService]] provides the main entry point into working with
 * Activities in Convergence. Activities provide a mechanism to communicate
 * `where` users are operating within a system and `what` they are doing.
 *
 * See the [developer guide](https://docs.convergence.io/guide/activities/overview.html)
 * for an introduction to Activities.
 *
 * @module Activities
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
    this._logger = Logging.logger("activities.service");
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

  public create(options: IActivityCreateOptions): Promise<void> {
    Validation.assertNonEmptyString(options.activityType, "options.activityType");

    const worldPermissions = options.worldPermissions || [];
    const userPermissions = ActivityPermissionUtils.userPermissions(options.userPermissions);
    const groupPermissions = ActivityPermissionUtils.toGroupPermissionsProto(options.groupPermissions);

    const activityCreateRequest: IActivityCreateRequestMessage = {
      activityId: options.activityId,
      activityType: options.activityType,
      worldPermissions,
      userPermissions,
      groupPermissions
    }

    const requestMessage: IConvergenceMessage = {activityCreateRequest};
    return this._connection.request(requestMessage).then(() => undefined);
  }

  public remove(activityId: string, activityType?: string): Promise<void> {
    Validation.assertNonEmptyString(activityType, "activityType");

    const activityDeleteRequest: IActivityDeleteRequestMessage = {
      activityId,
      activityType
    }

    const requestMessage: IConvergenceMessage = {activityDeleteRequest};
    return this._connection.request(requestMessage).then(() => undefined);
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
   * @param type
   *   The user defined type of the Activity to join.
   * @param id
   *   The unique id (within the type) of the Activity to join.
   * @param options
   *   Options for connecting to the specified Activity.
   *
   * @returns
   *   A Promise that will be resolved with the successfully joined
   *   [[Activity]].
   */
  public join(type: string, id: string, options?: IActivityJoinOptions): Promise<Activity> {
    let activity = this._joinedActivities.get(ActivityService._activityToIdString(type, id));
    if (activity === undefined) {
      activity = new Activity(type, id, this._identityCache, this._connection);

      this._joinedActivities.set(ActivityService._activityToIdString(type, id), activity);

      // The activity services will consolidate all events from all activities.
      // we tap this to look for the activity left event and remove that activity
      // from the joined activities.
      const activityEvents = activity
        .events()
        .pipe(
          filter((evt: IActivityEvent) => evt.name === ActivityLeftEvent.EVENT_NAME),
          tap(() => this._onActivityLeave(type, id))
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
   * @param type
   *   The user defined type of activity.
   * @param id
   *   The id (unique within the type) of the Activity to check.
   * @returns
   *   True if the Activity with the specified id is joined; false otherwise.
   */
  public isJoined(type: string, id: string): boolean {
    return this._joinedActivities.has(ActivityService._activityToIdString(type, id));
  }

  /**
   * @hidden
   * @internal
   */
  private _onActivityLeave(type: string, id: string): void {
    this._joinedActivities.delete(ActivityService._activityToIdString(type, id));
  }

  /**
   * @hidden
   * @internal
   */
  private static _activityToIdString(type: string, id: string): string {
    return `${type}/${id}`;
  }
}
