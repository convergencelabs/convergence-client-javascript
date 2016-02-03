import RealTimeData from "../RealTimeData";

abstract class ModelChangeEvent {
  /**
   * Constructs a new ModelChangeEvent.
   */
  constructor(public sessionId: string,
              public username: string,
              public version: number,
              public timestamp: number,
              public target: RealTimeData) {
  }
}

export default ModelChangeEvent;