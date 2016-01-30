/// <reference path="../util/EventEmitter.ts" />
/// <reference path="RealTimeObject.ts" />

module convergence.model {
  import EventEmitter = convergence.util.EventEmitter;
  import Session = convergence.Session;

  export class RealTimeModel extends EventEmitter {

    /**
     * Constructs a new RealTimeModel.
     */
    constructor(private _modelFqn: ModelFqn, private _data: RealTimeObject, private _session: Session) {
      super();
    }

    collectionId(): string {
      return this._modelFqn.collectionId;
    }

    modelId(): string {
      return this._modelFqn.modelId;
    }

    version(): number {
      return 0;
    }

    createdTime(): Date {
      return new Date();
    }

    modifiedTime(): Date {
      return new Date();
    }

    data(): RealTimeObject {
      return this._data;
    }

    /**
     * Gets the session of the connected user.
     * @return {convergence.Session} The users session.
     */
    session(): Session {
      return this._session;
    }
  }
}
