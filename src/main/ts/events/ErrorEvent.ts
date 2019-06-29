import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

export class ErrorEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "error";
  public readonly name: string = ErrorEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain, public readonly error: string) {
    Object.freeze(this);
  }
}
