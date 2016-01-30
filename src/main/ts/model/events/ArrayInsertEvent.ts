/// <reference path="ModelChangeEvent.ts" />

module convergence.model.event {

  export class ArrayInsertEvent extends ModelChangeEvent {
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
      // TODO: Freeze???
    }
  }
}
