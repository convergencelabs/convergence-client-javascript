import {IPresenceEvent} from "./IPresenceEvent";

export class PresenceStateSetEvent implements IPresenceEvent {
  public static readonly NAME = "state_set";
  public readonly name: string = PresenceStateSetEvent.NAME;

  constructor(public readonly username: string,
              public readonly state: Map<string, any>) {
    Object.freeze(this);
  }
}
