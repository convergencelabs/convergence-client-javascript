import {ConvergenceEvent} from "../../util/";

export interface ChatEvent extends ConvergenceEvent {
  readonly channelId: string;
}
