import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

export class ChatTopicChanged extends ChatEvent {
  public static readonly NAME = "topic_changed";
  public readonly name: string = ChatTopicChanged.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly topic: string
  ) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}
