import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

export class ReconnectedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "reconnected";
  public readonly name: string = ReconnectedEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain) {
    Object.freeze(this);
  }
}
