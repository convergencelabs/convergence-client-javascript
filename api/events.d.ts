import {ConvergenceEvent} from "./util/ConvergenceEvent";
import {ConvergenceDomain} from "./ConvergenceDomain";

export interface ConvergenceDomainEvent extends ConvergenceEvent {
  domain: ConvergenceDomain;
}

export declare class ConnectedEvent implements ConvergenceDomainEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly domain: ConvergenceDomain;
}

export declare class InterruptedEvent implements ConvergenceDomainEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly domain: ConvergenceDomain;
}

export declare class ReconnectedEvent implements ConvergenceDomainEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly domain: ConvergenceDomain;
}

export declare class DisconnectedEvent implements ConvergenceDomainEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly domain: ConvergenceDomain;
}

export declare class ConnectionErrorEvent implements ConvergenceDomainEvent {
  public static readonly NAME: string;
  public readonly name: string ;
  public readonly domain: ConvergenceDomain;
  public readonly error: string;
}
