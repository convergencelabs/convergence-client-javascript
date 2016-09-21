import {Session} from "../Session";
import {Activity} from "./Activity";
import {Observable} from "rxjs/Rx";
import {ActivityEvent} from "./events";

export declare class ActivityService {
  session(): Session;

  activity(id: string): Activity;

  joined(): Map<string, Activity>;

  isJoined(id: string): boolean;

  // todo what events actually come here?
  events(): Observable<ActivityEvent>;
}
