import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface  PresenceSubscriptionEvent extends ConvergenceEvent {
  username: string;
}

export class PresenceStateSetEvent implements PresenceSubscriptionEvent {
  static get NAME(): string {
    return "state_set";
  };

  public name: string = PresenceStateSetEvent.NAME;

  constructor(public username: string,
              public state: Map<string, any>) {
    Object.freeze(this);
  }
}

export class PresenceStateRemovedEvent implements PresenceSubscriptionEvent {
  static get NAME(): string {
    return "state_removed";
  };

  public name: string = PresenceStateRemovedEvent.NAME;

  constructor(public username: string,
              public keys: string[]) {
    Object.freeze(this);
  }
}

export class PresenceStateClearedEvent implements PresenceSubscriptionEvent {
  static get NAME(): string {
    return "state_cleared";
  };

  public name: string = PresenceStateClearedEvent.NAME;

  constructor(public username: string) {
    Object.freeze(this);
  }
}

export class PresenceAvailabilityChangedEvent implements PresenceSubscriptionEvent {
  static get NAME(): string {
    return "availability_changed";
  };

  public name: string = PresenceAvailabilityChangedEvent.NAME;

  constructor(public username: string,
              public available: boolean) {
    Object.freeze(this);
  }
}
