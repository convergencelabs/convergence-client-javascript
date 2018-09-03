import {ConvergenceEvent} from "../../util";

export interface PresenceSubscriptionEvent extends ConvergenceEvent {
  readonly username: string;
}
