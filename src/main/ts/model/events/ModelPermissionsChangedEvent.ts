import {IConvergenceEvent} from "../../util";
import {RealTimeModel} from "../rt";
import {ModelPermissions} from "../ModelPermissions";

export class ModelPermissionsChangedEvent implements IConvergenceEvent {
  public static readonly NAME = "permissions_changed";
  public readonly name: string = ModelPermissionsChangedEvent.NAME;

  /**
   * @param model
   * @param permissions
   * @param changes
   *
   * @hidden
   * @internal
   */
  constructor(public readonly model: RealTimeModel,
              public readonly permissions: ModelPermissions,
              public readonly changes: string[]) {
    Object.freeze(this);
  }
}
