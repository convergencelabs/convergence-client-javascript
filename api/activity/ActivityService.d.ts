import {Session} from "../Session";
import {Activity, ActivityJoinOptions} from "./Activity";
import {Observable} from "rxjs/Rx";
import {ActivityEvent} from "./events";

export declare class ActivityService {
  session(): Session;

  join(id: string, options?: ActivityJoinOptions): Promise<Activity>;

  joined(): Map<string, Activity>;

  isJoined(id: string): boolean;

  // todo what events actually come here?
  events(): Observable<ActivityEvent>;
}
