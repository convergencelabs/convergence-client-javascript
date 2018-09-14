import {IConvergenceEvent} from "../../util/";

export interface IChatEvent extends IConvergenceEvent {
  readonly channelId: string;
}
