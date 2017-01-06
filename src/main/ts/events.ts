import {ConvergenceEvent} from "./util/ConvergenceEvent";
import {ConvergenceDomain} from "./ConvergenceDomain";

export interface ConvergenceDomainEvent extends ConvergenceEvent {
  domain: ConvergenceDomain;
}

export class ConnectedEvent implements ConvergenceDomainEvent {
  public static readonly NAME = "connected";
  public readonly name: string = ConnectedEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain) {
    Object.freeze(this);
  }
}

export class InterruptedEvent implements ConvergenceDomainEvent {
  public static readonly NAME = "interrupted";
  public readonly name: string = InterruptedEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain) {
    Object.freeze(this);
  }
}

export class ReconnectedEvent implements ConvergenceDomainEvent {
  public static readonly NAME = "reconnected";
  public readonly name: string = ReconnectedEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain) {
    Object.freeze(this);
  }
}

export class DisconnectedEvent implements ConvergenceDomainEvent {
  public static readonly NAME = "disconnected";
  public readonly name: string = DisconnectedEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain) {
    Object.freeze(this);
  }
}

export class ConnectionErrorEvent implements ConvergenceDomainEvent {
  public static readonly NAME = "error";
  public readonly name: string = ConnectionErrorEvent.NAME;

  constructor(public readonly domain: ConvergenceDomain, public readonly error: string) {
    Object.freeze(this);
  }
}
