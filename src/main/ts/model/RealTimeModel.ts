module convergence.model {
  import EventEmitter = convergence.util.EventEmitter;
  import Session = convergence.Session;

  export class RealTimeModel extends EventEmitter {

    /**
     * Constructs a new RealTimeModel.
     */
    constructor(private _modelFqn: ModelFqn, private _session: Session) {
      super();
    }


    /**
     * Gets the session of the connected user.
     * @return {convergence.Session} The users session.
     */
    get session(): Session {
      return this._session;
    }
  }
}
