module convergence.model.event {

  export class ArrayRemoveEvent extends ModelChangeEvent {
    /**
     * Constructs a new ArrayRemoveEvent.
     */
    constructor(sessionId: string,
                username: string,
                version: number,
                timestamp: number,
                target: RealTimeArray,
                public index: number) {
      super(sessionId, username, version, timestamp, target);
      // TODO: Freeze???
    }
  }
}
