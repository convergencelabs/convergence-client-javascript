import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

export class PresenceStateClearedEvent implements IPresenceEvent {
  public static readonly NAME = "state_cleared";
  public readonly name: string = PresenceStateClearedEvent.NAME;

  constructor(public readonly user: DomainUser) {
    Object.freeze(this);
  }
}
