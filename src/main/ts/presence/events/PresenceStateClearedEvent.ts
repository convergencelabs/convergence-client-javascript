import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a particular [[DomainUser]]'s [[UserPresence.state|state]] was cleared.
 *
 * @module Presence Subsystem
 */
export class PresenceStateClearedEvent implements IPresenceEvent {
  public static readonly NAME = "state_cleared";

  /**
   * @inheritdoc
   */
  public readonly name: string = PresenceStateClearedEvent.NAME;

  constructor(
    /**
     * @inheritdoc
     */
    public readonly user: DomainUser
  ) {
    Object.freeze(this);
  }
}
