import {ObservableEventEmitter} from "../util/ObservableEventEmitter";
import {Session} from "../Session";
import {Activity} from "./Activity";

export declare class ActivityService extends ObservableEventEmitter {
  session(): Session;

  join(id: string, options?: ActivityJoinOptions): Promise<Activity>;

  joined(): Map<string, Activity>;

  isJoined(id: string): boolean;
}

export interface ActivityJoinOptions {
  state?: Map<string, any>;
}

