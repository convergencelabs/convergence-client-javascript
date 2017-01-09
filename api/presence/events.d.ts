import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface PresenceSubscriptionEvent extends ConvergenceEvent {
  readonly username: string;
}

export declare class PresenceStateSetEvent implements PresenceSubscriptionEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly username: string;
  public readonly state: Map<string, any>;
}

export class PresenceStateRemovedEvent implements PresenceSubscriptionEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly username: string;
  public readonly keys: string[];
}

export class PresenceStateClearedEvent implements PresenceSubscriptionEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly username: string;
}

export class PresenceAvailabilityChangedEvent implements PresenceSubscriptionEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly username: string;
  public readonly available: boolean;
}
