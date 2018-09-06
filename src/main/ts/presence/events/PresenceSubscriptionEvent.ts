import {IConvergenceEvent} from "../../util";

export interface PresenceSubscriptionEvent extends IConvergenceEvent {
  readonly username: string;
}
