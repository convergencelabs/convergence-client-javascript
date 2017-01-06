import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface  PresenceSubscriptionEvent extends ConvergenceEvent {
  readonly username: string;
}

export class PresenceStateSetEvent implements PresenceSubscriptionEvent {
  public static readonly NAME = "state_set";
  public readonly name: string = PresenceStateSetEvent.NAME;

  constructor(public readonly username: string,
              public state: Map<string, any>) {
    Object.freeze(this);
  }
}

export class PresenceStateRemovedEvent implements PresenceSubscriptionEvent {
  public static readonly NAME = "state_removed";
  public readonly name: string = PresenceStateRemovedEvent.NAME;

  constructor(public readonly username: string,
              public readonly keys: string[]) {
    Object.freeze(this);
  }
}

export class PresenceStateClearedEvent implements PresenceSubscriptionEvent {
  public static readonly NAME = "state_cleared";
  public readonly name: string = PresenceStateClearedEvent.NAME;

  constructor(public readonly username: string) {
    Object.freeze(this);
  }
}

export class PresenceAvailabilityChangedEvent implements PresenceSubscriptionEvent {
  public static readonly NAME = "availability_changed";
  public readonly name: string = PresenceAvailabilityChangedEvent.NAME;

  constructor(public readonly username: string,
              public readonly available: boolean) {
    Object.freeze(this);
  }
}
