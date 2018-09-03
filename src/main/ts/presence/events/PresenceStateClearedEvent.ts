import {PresenceSubscriptionEvent} from "./PresenceSubscriptionEvent";

export class PresenceStateClearedEvent implements PresenceSubscriptionEvent {
  public static readonly NAME = "state_cleared";
  public readonly name: string = PresenceStateClearedEvent.NAME;

  constructor(public readonly username: string) {
    Object.freeze(this);
  }
}
