import ModelChangeEvent from "./ModelChangeEvent";
import RealTimeNumber from "../RealTimeNumber";

export default class NumberAddEvent extends ModelChangeEvent {
  /**
   * Constructs a new NumberAddEvent.
   */
  constructor(sessionId: string,
              username: string,
              version: number,
              timestamp: number,
              target: RealTimeNumber,
              public value: number) {
    super(sessionId, username, version, timestamp, target);
    Object.freeze(this);
  }
}
