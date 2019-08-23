import {IConvergenceEvent} from "../../util";
import {ObservableModel} from "../observable/ObservableModel";

/**
 * A parent interface indicating an event that occurred on a [[RealTimeModel]].
 */
export interface IModelEvent extends IConvergenceEvent {

  /**
   * A read-only representation of the [[RealTimeModel]] on which this change occurred.
   */
  readonly src: ObservableModel;
}
