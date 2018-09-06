import {IConvergenceEvent} from "../../util/";

export interface ChatEvent extends IConvergenceEvent {
  readonly channelId: string;
}
