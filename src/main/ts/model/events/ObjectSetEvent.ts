/// <reference path="ModelChangeEvent.ts" />

module convergence.model.event {

  export class ObjectSetEvent extends ModelChangeEvent {
    /**
     * Constructs a new ObjectSetEvent.
     */
    constructor(sessionId: string,
                username: string,
                version: number,
                timestamp: number,
                target: RealTimeObject,
                public value: Object) {
      super(sessionId, username, version, timestamp, target);
      Object.freeze(this);
    }
  }
}
