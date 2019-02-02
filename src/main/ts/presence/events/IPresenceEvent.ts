import {IConvergenceEvent} from "../../util";
import {DomainUser} from "../../identity";

export interface IPresenceEvent extends IConvergenceEvent {
  readonly user: DomainUser;
}
