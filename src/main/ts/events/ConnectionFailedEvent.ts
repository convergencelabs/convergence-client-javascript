import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

export class ConnectionFailedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "connection_failed";
  public readonly name: string = ConnectionFailedEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain) {
    Object.freeze(this);
  }
}
