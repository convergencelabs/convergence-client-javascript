import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {Session} from "../Session";
import {Activity} from "./Activity";

export declare class ActivityService extends ConvergenceEventEmitter {
  session(): Session;

  join(id: string, options?: ActivityJoinOptions): Promise<Activity>;

  joined(): Map<string, Activity>;

  isJoined(id: string): boolean;
}

export interface ActivityJoinOptions {
  state?: Map<string, any>;
}

