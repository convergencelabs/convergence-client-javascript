import {IPresenceEvent} from "./IPresenceEvent";

export class PresenceAvailabilityChangedEvent implements IPresenceEvent {
  public static readonly NAME = "availability_changed";
  public readonly name: string = PresenceAvailabilityChangedEvent.NAME;

  constructor(public readonly username: string,
              public readonly available: boolean) {
    Object.freeze(this);
  }
}
