import {IConvergenceEvent} from "../util";
import {ConvergenceDomain} from "../ConvergenceDomain";

/**
 * The base interface for any [[ConvergenceDomain]]-related events.
 *
 * @module Connection and Authentication
 */
export interface IConvergenceDomainEvent extends IConvergenceEvent {
  /**
   * The domain on which this event occurred.
   */
  domain: ConvergenceDomain;
}
