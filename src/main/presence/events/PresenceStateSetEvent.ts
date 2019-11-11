import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when one or more items of a particular [[DomainUser]]'s presence
 * [[UserPresence.state|state]] were [[PresenceService.setState|set]].
 *
 * @category Presence Subsystem
 */
export class PresenceStateSetEvent implements IPresenceEvent {
  public static readonly NAME = "state_set";

  /**
   * @inheritdoc
   */
  public readonly name: string = PresenceStateSetEvent.NAME;

  constructor(
    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * The entire new state (as opposed to only the items that changed) for the
     * [[user]].
     */
    public readonly state: Map<string, any>
  ) {
    Object.freeze(this);
  }
}
