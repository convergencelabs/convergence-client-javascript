import {IConvergenceEvent} from "../../util";
import {ObservableModel} from "../observable/ObservableModel";

/**
 * A parent interface indicating an event that occurred on a [[RealTimeModel]].
 */
export interface IModelEvent extends IConvergenceEvent {

  /**
   * The [[RealTimeModel]] or [[HistoricalModel]] on which this change occurred.
   */
  readonly src: ObservableModel;
}
