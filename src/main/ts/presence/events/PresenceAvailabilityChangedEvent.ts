import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when the availability of a particular [[DomainUser]] changed.
 *
 * @module Presence Subsystem
 */
export class PresenceAvailabilityChangedEvent implements IPresenceEvent {
  public static readonly NAME = "availability_changed";

  /**
   * @inheritdoc
   */
  public readonly name: string = PresenceAvailabilityChangedEvent.NAME;

  constructor(
    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * The new availability of the [[user]].
     */
    public readonly available: boolean
  ) {
    Object.freeze(this);
  }
}
