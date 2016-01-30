module convergence.model.event {

  export class NumberSetEvent extends ModelChangeEvent {
    /**
     * Constructs a new NumberSetEvent.
     */
    constructor(sessionId: string,
                username: string,
                version: number,
                timestamp: number,
                target: RealTimeNumber,
                public value: number) {
      super(sessionId, username, version, timestamp, target);
      // TODO: Freeze???
    }
  }
}
