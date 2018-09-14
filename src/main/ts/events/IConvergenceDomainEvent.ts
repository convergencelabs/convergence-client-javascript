import {IConvergenceEvent} from "../util";
import {ConvergenceDomain} from "../ConvergenceDomain";

export interface IConvergenceDomainEvent extends IConvergenceEvent {
  domain: ConvergenceDomain;
}
