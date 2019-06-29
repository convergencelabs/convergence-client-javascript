import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

export class ConnectingEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "connecting";
  public readonly name: string = ConnectingEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain) {
    Object.freeze(this);
  }
}
