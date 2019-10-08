import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a [[Chat]]'s topic changes.
 */
export class ChatTopicChangedEvent extends ChatEvent {
  public static readonly NAME = "topic_changed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ChatTopicChangedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    chatId: string,
    eventNumber: number,
    timestamp: Date,
    user: DomainUser,

    /**
     * The Chat's new topic
     */
    public readonly topic: string
  ) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}
