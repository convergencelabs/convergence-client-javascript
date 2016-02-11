import Event from "../util/Event";
import RealTimeValue from "./RealTimeValue";

export interface ModelChangeEvent extends Event {
  src: RealTimeValue<any>;
  sessionId: string;
  userId: string;
  version: number;
  timestamp: number;
}

export interface ModelDetachedEvent extends Event {
  src: RealTimeValue<any>;
}
