import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when one or more key-value pairs of a particular [[DomainUser]]'s
 * presence [[UserPresence.state|state]] were [[PresenceService.removeState|removed]].
 *
 * @module Presence
 */
export class PresenceStateRemovedEvent implements IPresenceEvent {
  public static readonly NAME = "state_removed";

  /**
   * @inheritdoc
   */
  public readonly name: string = PresenceStateRemovedEvent.NAME;

  constructor(
    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * The keys of the state items that were just removed.
     */
    public readonly keys: string[]
  ) {
    Object.freeze(this);
  }
}
