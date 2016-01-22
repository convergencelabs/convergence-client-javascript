module convergence {
  import EventEmitter = convergence.util.EventEmitter;
  import Session = convergence.Session;

  export class ConvergenceDomain extends EventEmitter {


    /**
     * Constructs a new ConvergenceDomain using the default options.
     *
     * @param url
     *            The url of the convergence domain to connect to.
     */
    constructor(url: String) {
      super();
    }

    /**
     * Authenticates the user with the given username and password.
     * @param {string} username - The username of the user
     * @param {string} password - The password of the user
     * @return {Q.Promise} A promise
     */
    authenticateWithPassword(username, password): Q.Promise<void> {
      return Q.resolve<void>(null);
    }

    /**
     * Authenticates the user with the given username.
     * @param {string} token - The identifier of the participant
     * @return {Q.Promise} A promise
     */
    authenticateWithToken(token): Q.Promise<void> {
      return Q.resolve<void>(null);
    }

    /**
     * Gets the session of the connected user.
     * @return {convergence.Session} The users session.
     */
    getSession(): Session {
      return null;
    }

    /**
     * Gets the MessageService
     * @returns {convergence.SharedModelService}
     */
    getSharedModelService(): void {
      return null;
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
