import {IConvergenceModelValueEvent} from "./IConvergenceModelValueEvent";
import {DomainUser} from "../../identity";

/**
 * The [[IValueChangedEvent]] is the parent interface to all events fired by
 * individual model elements when their data changes.
 */
export interface IValueChangedEvent extends IConvergenceModelValueEvent {
  readonly user: DomainUser;
  readonly sessionId: string;
  readonly local: boolean;
}
