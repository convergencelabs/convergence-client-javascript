import {IChatEvent} from "./IChatEvent";
import {DomainUser} from "../../identity";

/**
 * A superclass for any events occurring on a particular existing [[Chat]].
 */
export abstract class ChatEvent implements IChatEvent {
  public abstract readonly name: string;

  /**
   * @param chatId
   * @param eventNumber
   * @param timestamp
   * @param user
   *
   * @hidden
   * @internal
   */
  protected constructor(
    /**
     * The ID of the [[Chat]] on which this event occurred
     */
    public readonly chatId: string,

    /**
     * This event's unique sequential number.  This can be useful when e.g. querying for
     * events on a particular chat ([[Chat.getHistory]]).
     */
    public readonly eventNumber: number,

    /**
     * The timestamp when the event occurred
     */
    public readonly timestamp: Date,

    /**
     * The user associated wth the event
     */
    public readonly user: DomainUser
  ) {}
}
