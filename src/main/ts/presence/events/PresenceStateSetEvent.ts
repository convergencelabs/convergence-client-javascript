import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

export class PresenceStateSetEvent implements IPresenceEvent {
  public static readonly NAME = "state_set";
  public readonly name: string = PresenceStateSetEvent.NAME;

  constructor(public readonly user: DomainUser,
              public readonly state: Map<string, any>) {
    Object.freeze(this);
  }
}
