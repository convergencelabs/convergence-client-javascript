import {IPresenceEvent} from "./IPresenceEvent";

export class PresenceStateClearedEvent implements IPresenceEvent {
  public static readonly NAME = "state_cleared";
  public readonly name: string = PresenceStateClearedEvent.NAME;

  constructor(public readonly username: string) {
    Object.freeze(this);
  }
}
