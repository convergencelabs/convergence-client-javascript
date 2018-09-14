import {IConvergenceEvent} from "../../util";

export interface IPresenceEvent extends IConvergenceEvent {
  readonly username: string;
}
