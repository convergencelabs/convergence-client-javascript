import {IConvergenceEvent} from "../../util";
import {DomainUser} from "../../identity";

/**
 * The base interface for [[UserPresence]]-related events.
 *
 * @module Presence Subsystem
 */
export interface IPresenceEvent extends IConvergenceEvent {
  /**
   * The user associated with the [[UserPresence|presence]] event.
   */
  readonly user: DomainUser;
}
