import {IConvergenceEvent} from "../../util";
import {ObservableElement} from "../observable/ObservableElement";

/**
 * The [[IConvergenceModelValueEvent]] is the parent interface of all events
 * representing changes to model values.
 */
export interface IConvergenceModelValueEvent extends IConvergenceEvent {

  /**
   * A read-only representation of the [[RealTimeElement]] whose contents changed.
   */
  readonly element: ObservableElement<any>;

  /**
   * True if the change occurred locally (within the current session)
   */
  readonly local: boolean;
}
