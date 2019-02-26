import {IConvergenceEvent} from "../../util/";

export interface IChatEvent extends IConvergenceEvent {
  readonly chatId: string;
}
