import {IConvergenceEvent} from "../../util";
import {ObservableElement} from "../observable/ObservableElement";

/**
 * The [[IConvergenceModelValueEvent]] is the parent interface of all events
 * representing changes to model values.
 */
export interface IConvergenceModelValueEvent extends IConvergenceEvent {
  readonly element: ObservableElement<any>;
  readonly local: boolean;
}
