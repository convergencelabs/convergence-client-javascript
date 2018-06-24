import {ConvergenceEvent} from "../../util";
import {Activity} from "../";

export interface ActivityEvent extends ConvergenceEvent {
  readonly activity: Activity;
  readonly username: string;
  readonly sessionId: string;
  readonly local: boolean;
}
