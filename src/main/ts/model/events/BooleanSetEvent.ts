import ModelChangeEvent from "./ModelChangeEvent";
import RealTimeBoolean from "../RealTimeBoolean";

export default class BooleanSetEvent extends ModelChangeEvent {
  /**
   * Constructs a new BooleanSetEvent.
   */
  constructor(sessionId: string,
              username: string,
              version: number,
              timestamp: number,
              target: RealTimeBoolean,
              public value: boolean) {
    super(sessionId, username, version, timestamp, target);
    Object.freeze(this);
  }
}
