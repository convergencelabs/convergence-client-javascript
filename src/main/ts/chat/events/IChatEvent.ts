import {IConvergenceEvent} from "../../util/";

/**
 * The superclass for all chat-related events.
 *
 * @module Chat
 */
export interface IChatEvent extends IConvergenceEvent {
  readonly chatId: string;
}
