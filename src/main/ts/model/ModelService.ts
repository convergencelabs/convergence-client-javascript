module convergence.model {
  import EventEmitter = convergence.util.EventEmitter;
  import Session = convergence.Session;

  export class ModelService extends EventEmitter {

    /**
     * Constructs a new ModelService.
     */
    constructor(private _session: Session) {
      super();
    }

    /**
     * Gets the session of the connected user.
     * @return {convergence.Session} The users session.
     */
    get session(): Session {
      return this._session;
    }

    /**
     * Opens a real time model in a given collection
     *
     * @param {string} collectionId
     *            The collectionId of the model
     * @param {string} modelId
     *            The modelId
     * @return {Q.Promise} A promise that resolves with a RealTimeModel
     */
    open(collectionId: string, modelId: string): Q.Promise<convergence.model.RealTimeModel> {
      return null;
    }

    /**
     * Create a new real time model with the given value in a given collection
     *
     * @param {string} collectionId
     *            The collection to add the model to
     * @param {string} modelId
     *            The id of the new model
     * @param {string} data
     *            The initial value
     * @return {Q.Promise} A Promise that resolves when the model is finished being created
     */
    create(collectionId: string, modelId: string, data: any): Q.Promise<void> {
      return null;
    }

    /**
     * Removes an existing model in a given collection
     *
     * @param {string} collectionId
     *            The collection the model belongs to
     * @param {string} modelId
     *            The id of the model to remove
     * @return {Q.Promise} A Promise that resolves when the model is finished being deleted
     */
    remove(collectionId: string, modelId: string): Q.Promise<void> {
      return null;
    }
  }
}
