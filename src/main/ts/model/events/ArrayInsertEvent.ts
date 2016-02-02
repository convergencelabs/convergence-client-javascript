import ModelChangeEvent from "./ModelChangeEvent";
import RealTimeArray from "../RealTimeArray";

export default class ArrayInsertEvent extends ModelChangeEvent {
  /**
   * Constructs a new ArrayInsertEvent.
   */
  constructor(sessionId: string,
              username: string,
              version: number,
              timestamp: number,
              target: RealTimeArray,
              public index: number,
              public value: Object|number|string|boolean) {
    super(sessionId, username, version, timestamp, target);
    Object.freeze(this);
  }
}
