import {Session} from "../Session";
import {Activity, ActivityJoinOptions} from "./Activity";
import {Observable} from "rxjs/Rx";
import {ActivityEvent} from "./events";
import {ObservableEventEmitter} from "../util/ObservableEventEmitter";

export declare class ActivityService extends ObservableEventEmitter {
  session(): Session;

  join(id: string, options?: ActivityJoinOptions): Promise<Activity>;

  joined(): Map<string, Activity>;

  isJoined(id: string): boolean;
}

export interface ActivityJoinOptions {
  state?: Map<string, any>;
}

