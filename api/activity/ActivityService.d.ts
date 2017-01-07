import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {Session} from "../Session";
import {Activity} from "./Activity";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {StringMapLike} from "../util/StringMap";

export declare class ActivityService extends ConvergenceEventEmitter<ConvergenceEvent> {
  public session(): Session;

  public join(id: string, options?: ActivityJoinOptions): Promise<Activity>;

  public joined(): Map<string, Activity>;

  public isJoined(id: string): boolean;
}

export interface ActivityJoinOptions {
  state?: StringMapLike;
}
