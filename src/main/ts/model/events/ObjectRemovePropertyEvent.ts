/// <reference path="ModelChangeEvent.ts" />

module convergence.model.event {

  export class ObjectRemovePropertyEvent extends ModelChangeEvent {
    /**
     * Constructs a new ObjectRemovePropertyEvent.
     */
    constructor(sessionId: string,
                username: string,
                version: number,
                timestamp: number,
                target: RealTimeObject,
                public property: string) {
      super(sessionId, username, version, timestamp, target);
      // TODO: Freeze???
    }
  }
}
