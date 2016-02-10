import RealTimeValue from "../RealTimeValue";

abstract class ModelChangeEvent {
  /**
   * Constructs a new ModelChangeEvent.
   */
  constructor(public sessionId: string,
              public username: string,
              public version: number,
              public timestamp: number,
              public target: RealTimeValue<any>) {
  }
}

export default ModelChangeEvent;
