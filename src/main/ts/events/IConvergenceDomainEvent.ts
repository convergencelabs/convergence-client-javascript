import {IConvergenceEvent} from "../util";
import {ConvergenceDomain} from "../ConvergenceDomain";

export interface IConvergenceDomainEvent extends IConvergenceEvent {
  /**
   * The domain on which this event occurred.
   */
  domain: ConvergenceDomain;
}
