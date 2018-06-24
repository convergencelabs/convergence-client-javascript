import {Activity} from "../Activity";
import {ConvergenceEvent} from "../../util/";

export interface ActivityEvent extends ConvergenceEvent {
  readonly activity: Activity;
  readonly username: string;
  readonly sessionId: string;
  readonly local: boolean;
}
