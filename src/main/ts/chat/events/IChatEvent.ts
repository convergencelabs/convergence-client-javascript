import {IConvergenceEvent} from "../../util/";

/**
 * The superclass for all chat-related events.
 *
 * @category Chat Subsytem
 */
export interface IChatEvent extends IConvergenceEvent {
  readonly chatId: string;
}
