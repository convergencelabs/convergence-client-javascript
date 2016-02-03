import ModelChangeEvent from "./ModelChangeEvent";
import RealTimeString from "../RealTimeString";

export default class StringRemoveEvent extends ModelChangeEvent {
  /**
   * Constructs a new StringRemoveEvent.
   */
  constructor(sessionId: string,
              username: string,
              version: number,
              timestamp: number,
              target: RealTimeString,
              public index: number,
              public value: string) {
    super(sessionId, username, version, timestamp, target);
    Object.freeze(this);
  }
}
