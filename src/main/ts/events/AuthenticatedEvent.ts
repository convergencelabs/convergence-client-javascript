import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

export class AuthenticatedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "authenticated";
  public readonly name: string = AuthenticatedEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain,
              public readonly method: string) {
    Object.freeze(this);
  }
}
