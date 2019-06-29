import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

export class ConnectionScheduledEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "connection_scheduled";
  public readonly name: string = ConnectionScheduledEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain,
              public readonly delay: number) {
    Object.freeze(this);
  }
}
