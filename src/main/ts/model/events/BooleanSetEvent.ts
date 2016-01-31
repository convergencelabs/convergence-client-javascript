/// <reference path="ModelChangeEvent.ts" />

module convergence.model.event {

  export class BooleanSetEvent extends ModelChangeEvent {
    /**
     * Constructs a new BooleanSetEvent.
     */
    constructor(sessionId: string,
                username: string,
                version: number,
                timestamp: number,
                target: RealTimeBoolean,
                public value: boolean) {
      super(sessionId, username, version, timestamp, target);
      Object.freeze(this);
    }
  }
}
