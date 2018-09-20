import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

export class InterruptedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "interrupted";
  public readonly name: string = InterruptedEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain) {
    Object.freeze(this);
  }
}
