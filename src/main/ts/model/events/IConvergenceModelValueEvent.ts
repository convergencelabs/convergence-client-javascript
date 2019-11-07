import {IConvergenceEvent} from "../../util";
import {ObservableElement} from "../observable/ObservableElement";

/**
 * The [[IConvergenceModelValueEvent]] is the parent interface of all events
 * representing changes to model values.
 *
 * @module Real Time Data
 */
export interface IConvergenceModelValueEvent extends IConvergenceEvent {

  /**
   * The [[RealTimeElement]] or [[HistoricalElement]] whose contents changed.
   */
  readonly element: ObservableElement<any>;

  /**
   * True if the change occurred locally (within the current session)
   */
  readonly local: boolean;
}
