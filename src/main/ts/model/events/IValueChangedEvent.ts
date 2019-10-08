import {IConvergenceModelValueEvent} from "./IConvergenceModelValueEvent";
import {DomainUser} from "../../identity";

/**
 * The [[IValueChangedEvent]] is the parent interface to all events fired by
 * individual model elements when their data changes.
 *
 * @category Real Time Data Subsystem
 */
export interface IValueChangedEvent extends IConvergenceModelValueEvent {
  /**
   * The user which performed the modification
   */
  readonly user: DomainUser;

  /**
   * The sessionId corresponding to the session that performed the modification
   */
  readonly sessionId: string;
}
