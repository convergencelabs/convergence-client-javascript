import {PresenceSubscriptionEvent} from "./PresenceSubscriptionEvent";

export class PresenceStateSetEvent implements PresenceSubscriptionEvent {
  public static readonly NAME = "state_set";
  public readonly name: string = PresenceStateSetEvent.NAME;

  constructor(public readonly username: string,
              public readonly state: Map<string, any>) {
    Object.freeze(this);
  }
}
