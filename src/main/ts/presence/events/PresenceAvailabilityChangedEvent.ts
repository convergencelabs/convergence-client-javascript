import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

export class PresenceAvailabilityChangedEvent implements IPresenceEvent {
  public static readonly NAME = "availability_changed";
  public readonly name: string = PresenceAvailabilityChangedEvent.NAME;

  constructor(public readonly user: DomainUser,
              public readonly available: boolean) {
    Object.freeze(this);
  }
}
