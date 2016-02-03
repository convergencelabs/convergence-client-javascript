import ModelChangeEvent from "./ModelChangeEvent";
import RealTimeArray from "../RealTimeArray";

export default class ArraySetEvent extends ModelChangeEvent {
  /**
   * Constructs a new ArraySetEvent.
   */
  constructor(sessionId: string,
              username: string,
              version: number,
              timestamp: number,
              target: RealTimeArray,
              public value: Array<Object|number|string|boolean>) {
    super(sessionId, username, version, timestamp, target);
    Object.freeze(this);
  }
}
