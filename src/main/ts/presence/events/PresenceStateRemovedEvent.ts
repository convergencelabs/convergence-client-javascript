import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

export class PresenceStateRemovedEvent implements IPresenceEvent {
  public static readonly NAME = "state_removed";
  public readonly name: string = PresenceStateRemovedEvent.NAME;

  constructor(public readonly user: DomainUser,
              public readonly keys: string[]) {
    Object.freeze(this);
  }
}
