import {ActivityEvent} from "./ActivityEvent";
import {Activity} from "../";

export declare class StateRemovedEvent implements ActivityEvent {
  public static readonly NAME: string;

  public readonly name: string;
  public readonly activity: Activity;
  public readonly username: string;
  public readonly sessionId: string;
  public readonly local: boolean;
  public readonly key: string;
}
