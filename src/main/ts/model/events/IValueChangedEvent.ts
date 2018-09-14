import {IConvergenceModelValueEvent} from "./IConvergenceModelValueEvent";

/**
 * The [[IValueChangedEvent]] is the parent interface to all events fired by
 * individual model elements when their data changes.
 */
export interface IValueChangedEvent extends IConvergenceModelValueEvent {
  readonly sessionId: string;
  readonly username: string;
  readonly local: boolean;
}
