import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

export class AuthenticationFailedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "authentication_failed";
  public readonly name: string = AuthenticationFailedEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain,
              public readonly method: string) {
    Object.freeze(this);
  }
}
