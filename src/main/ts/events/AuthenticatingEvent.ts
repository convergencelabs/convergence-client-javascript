import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

export class AuthenticatingEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "authenticating";
  public readonly name: string = AuthenticatingEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain,
              public readonly method: string) {
    Object.freeze(this);
  }
}
