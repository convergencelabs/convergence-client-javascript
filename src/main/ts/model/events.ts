import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {RealTimeValue} from "./RealTimeValue";

export interface ModelChangeEvent extends ConvergenceEvent {
  src: RealTimeValue<any>;
  sessionId: string;
  username: string;
  version: number;
  timestamp: number;
}

export interface ModelDetachedEvent extends ConvergenceEvent {
  src: RealTimeValue<any>;
}
