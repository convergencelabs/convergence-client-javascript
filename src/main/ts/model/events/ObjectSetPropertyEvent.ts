/// <reference path="ModelChangeEvent.ts" />

module convergence.model.event {

  export class ObjectSetPropertyEvent extends ModelChangeEvent {
    /**
     * Constructs a new ObjectSetPropertyEvent.
     */
    constructor(sessionId: string,
                username: string,
                version: number,
                timestamp: number,
                target: RealTimeObject,
                public property: string,
                public value: Object|number|string|boolean) {
      super(sessionId, username, version, timestamp, target);
      Object.freeze(this);
    }
  }
}
