import {AbstractPermissionManager} from "../permissions/AbstractPermissionsManager";
import {ActivityPermission} from "./ActivityPermission";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {com} from "@convergence/convergence-proto";
import IPermissionTarget = com.convergencelabs.convergence.proto.core.IPermissionTarget;

/**
 * The [[ActivityPermissionManager]] manages the permissions for a particular
 * Activity within the domain.
 *
 * @module Activities
 */
export class ActivityPermissionManager extends AbstractPermissionManager<ActivityPermission> {

  private readonly _target: IPermissionTarget;

  constructor(type: string, id: string, connection: ConvergenceConnection) {
    super(connection);
    this._target = {
      activity: {type, id}
    };
  }

  /**
   * @returns The user defined activity type of the activity that the
   * permissions manager is managing the permissions for.
   */
  public type(): string {
    return this._target.activity.type;
  }

  /**
   * @returns The unique id within the type of the activity that the
   * permissions manager is managing the permissions for.
   */
  public id(): string {
    return this._target.activity.id;
  }

  /**
   * @internal
   * @hidden
   */
  protected _getTarget(): IPermissionTarget {
    return this._target;
  }
}