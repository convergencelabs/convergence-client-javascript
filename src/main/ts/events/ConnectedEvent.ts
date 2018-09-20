import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

export class ConnectedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "connected";
  public readonly name: string = ConnectedEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain) {
    Object.freeze(this);
  }
}
