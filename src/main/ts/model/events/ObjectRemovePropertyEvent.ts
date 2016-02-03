import ModelChangeEvent from "./ModelChangeEvent";
import RealTimeObject from "../RealTimeObject";

export default class ObjectRemovePropertyEvent extends ModelChangeEvent {
  /**
   * Constructs a new ObjectRemovePropertyEvent.
   */
  constructor(sessionId: string,
              username: string,
              version: number,
              timestamp: number,
              target: RealTimeObject,
              public property: string) {
    super(sessionId, username, version, timestamp, target);
    Object.freeze(this);
  }
}
