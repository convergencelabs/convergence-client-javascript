import {ConvergenceEvent} from "../util/ConvergenceEvent";

abstract class PresenceSubscriptionEvent implements ConvergenceEvent {
  constructor(public username: string) {
  }
}

export class PresenceStateSetEvent extends PresenceSubscriptionEvent {
  static get NAME() { return "state_set";};

  public name: string = PresenceStateSetEvent.NAME;

  constructor(
    username: string,
    public state: Map<string, any>) {
    super(username);
    Object.freeze(this);
  }
}

export class PresenceStateRemovedEvent extends PresenceSubscriptionEvent {
  static get NAME() { return "state_removed";};

  public name: string = PresenceStateRemovedEvent.NAME;

  constructor(
    username: string,
    public keys: string[]) {
    super(username);
    Object.freeze(this);
  }
}

export class PresenceStateClearedEvent extends PresenceSubscriptionEvent {
  static get NAME() { return "state_cleared";};

  public name: string = PresenceStateClearedEvent.NAME;

  constructor(
    username: string) {
    super(username);
    Object.freeze(this);
  }
}

export class PresenceAvailabilityChangedEvent extends PresenceSubscriptionEvent {
  static get NAME() { return "availability_changed";};

  public name: string = PresenceAvailabilityChangedEvent.NAME;

  constructor(
    username: string,
    public available: boolean) {
    super(username);
    Object.freeze(this);
  }
}
