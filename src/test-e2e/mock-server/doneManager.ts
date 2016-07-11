import {MockConvergenceServer} from "./MockConvergenceServer";

/**
 * Exposes methods so the calling test framework can indicate success or failure
 * of tests in a consistent manner.
 */
export interface IDoneManager {

  /**
   * Indicates that the unit test has completed all of its steps successfully.
   * It may be the case that the server is still expecting things, so this
   * may not immediately resolve the test.
   */
  testSuccess(): void;

  /**
   * Indicates that the until test has enounctered some failure.  This will
   * immediately fail the test.
   *
   * @param error The error that occured.
   */
  testFailure(error?: Error): void;
}

/**
 * Base class for the done managers.
 */
export abstract class AbstractDoneManager implements IDoneManager {
  private _serverDone: boolean;
  private _testDone: boolean;
  private _resolved: boolean;

  constructor(private _mockServer: MockConvergenceServer) {
    this._serverDone = false;
    this._testDone = false;
    this._resolved = false;
  }

  testSuccess(): void {
    this._testDone = true;
    if (!this._resolved && this._serverDone) {
      this._resolved = true;
      this._mockServer.stop();
      this._onSuccess();
    }
  }

  testFailure(error?: Error): void {
    if (!this._resolved) {
      this._resolved = true;
      this._mockServer.stop();
      this._onFailure(error);
    }
  }

  serverDone(): void {
    this._serverDone = true;
    if (!this._resolved && this._testDone) {
      this._resolved = true;
      this._mockServer.stop();
      this._onSuccess();
    }
  }

  protected abstract _onSuccess(): void;

  protected abstract _onFailure(error: Error): void;
}

/**
 * Implements a generic done manager based on callback functions. This can
 * be used to support any testing framewrok.
 */
export class CallbackDoneManager extends AbstractDoneManager {

  constructor(_mockServer: MockConvergenceServer, private _successCallback: () => void, private _errorCallback: (error: Error) => void) {
    super(_mockServer);
  }

  protected _onSuccess(): void {
    this._successCallback();
  }

  protected _onFailure(error: Error): void {
    this._errorCallback(error);
  }
}

/**
 * A specific helper done manager that integrates with the Mocha testing framework.
 */
export class MochaDoneManager extends CallbackDoneManager {
  constructor(_mockServer: MockConvergenceServer, _mochaDone: MochaDone) {
    super(_mockServer, _mochaDone, _mochaDone);
  }
}
