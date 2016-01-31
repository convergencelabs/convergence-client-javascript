/// <reference path="ModelChangeEvent.ts" />

module convergence.model.event {

  export class StringSetEvent extends ModelChangeEvent {
    /**
     * Constructs a new StringSetEvent.
     */
    constructor(sessionId: string,
                username: string,
                version: number,
                timestamp: number,
                target: RealTimeString,
                public value: string) {
      super(sessionId, username, version, timestamp, target);
      Object.freeze(this);
    }
  }
}
