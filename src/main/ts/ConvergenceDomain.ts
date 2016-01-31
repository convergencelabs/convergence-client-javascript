/// <reference path="util/EventEmitter.ts" />
/// <reference path="model/ModelService.ts" />

module convergence {

  "use strict";

  import ModelService = convergence.model.ModelService;
  import EventEmitter = convergence.util.EventEmitter;
  import Session = convergence.Session;

  export class ConvergenceDomain extends EventEmitter {

    private _modelService: ModelService;

    /**
     * Constructs a new ConvergenceDomain using the default options.
     *
     * @param url
     *            The url of the convergence domain to connect to.
     */
    constructor(url: string) {
      super();
      // TODO: Pass in Session
      this._modelService = new ModelService(null);
    }

    /**
     * Authenticates the user with the given username and password.
     * @param {string} username - The username of the user
     * @param {string} password - The password of the user
     * @return {Q.Promise} A promise
     */
    authenticateWithPassword(username: string, password: string): Q.Promise<void> {
      return Q.resolve<void>(null);
    }

    /**
     * Authenticates the user with the given username.
     * @param {string} token - The identifier of the participant
     * @return {Q.Promise} A promise
     */
    authenticateWithToken(token: string): Q.Promise<void> {
      return Q.resolve<void>(null);
    }

    isAuthenticated(): boolean {
      return false;
    }

    /**
     * Gets the session of the connected user.
     * @return {convergence.Session} The users session.
     */
    session(): Session {
      // TODO: implement this
      return null;
    }

    /**
     * Gets the ModelService
     */
    modelService(): ModelService {
      return this._modelService;
    }

    /**
     * Closes the connection to the server and disposes of the ConvergenceDomain
     */
    dispose(): void {
    }

    /**
     * @returns {boolean} True if this ConvergenceDomain is disposed.
     */
    isDisposed(): boolean {
      return false;
    }
  }
}
