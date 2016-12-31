import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface PresenceSubscriptionEvent extends ConvergenceEvent {
  username: string;
}

export declare class PresenceStateSetEvent implements PresenceSubscriptionEvent {
  public src: any;
  public name: string;
  public username: string;
  public state: Map<string, any>;
}

export class PresenceStateRemovedEvent implements PresenceSubscriptionEvent {
  public src: any;
  public name: string;
  public username: string;
  public keys: string[];
}

export class PresenceStateClearedEvent implements PresenceSubscriptionEvent {
  public src: any;
  public name: string;
  public username: string;
}

export class PresenceAvailabilityChangedEvent implements PresenceSubscriptionEvent {
  public src: any;
  public name: string;
  public username: string;
  public available: boolean;
}
