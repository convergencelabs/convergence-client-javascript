module convergence.model.event {

  export class NumberAddEvent extends ModelChangeEvent {
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
      // TODO: Freeze???
    }
  }
}
