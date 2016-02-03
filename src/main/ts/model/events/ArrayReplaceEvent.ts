import RealTimeArray from "../RealTimeArray";
import ModelChangeEvent from "./ModelChangeEvent";

export default class ArrayReplaceEvent extends ModelChangeEvent {
  /**
   * Constructs a new ArrayReplaceEvent.
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
