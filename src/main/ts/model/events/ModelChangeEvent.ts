module convergence.model.event {

  export abstract class ModelChangeEvent {
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
}
