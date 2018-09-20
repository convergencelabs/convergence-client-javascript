import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

export class DisconnectedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "disconnected";
  public readonly name: string = DisconnectedEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain) {
    Object.freeze(this);
  }
}
