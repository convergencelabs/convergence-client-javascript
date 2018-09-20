import {IPresenceEvent} from "./IPresenceEvent";

export class PresenceStateRemovedEvent implements IPresenceEvent {
  public static readonly NAME = "state_removed";
  public readonly name: string = PresenceStateRemovedEvent.NAME;

  constructor(public readonly username: string,
              public readonly keys: string[]) {
    Object.freeze(this);
  }
}
