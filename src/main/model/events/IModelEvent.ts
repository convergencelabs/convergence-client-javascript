import {IConvergenceEvent} from "../../util";
import {ObservableModel} from "../observable/ObservableModel";

/**
 * A parent interface indicating an event that occurred on a [[RealTimeModel]].
 *
 * @category Real Time Data Subsystem
 */
export interface IModelEvent extends IConvergenceEvent {

  /**
   * The [[RealTimeModel]] or [[HistoricalModel]] on which this event occurred.
   */
  readonly src: ObservableModel;
}
