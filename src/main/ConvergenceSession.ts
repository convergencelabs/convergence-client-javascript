/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ConvergenceConnection} from "./connection/ConvergenceConnection";
import {ConvergenceDomain} from "./ConvergenceDomain";
import {DomainUser} from "./identity";
import {ConvergenceError} from "./util";
import {ConvergenceErrorCodes} from "./util/ConvergenceErrorCodes";

/**
 * This represents connection state information for a
 * particular connection to a specific domain.  It is tied to the client device
 * rather than the user, so a single user could potentially have multiple sessions
 * open at a time.
 *
 * @module Users and Identity
 */
export class ConvergenceSession {

  /**
   * @hidden
   * @internal
   */
  private readonly _domain: ConvergenceDomain;

  /**
   * @hidden
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @hidden
   * @internal
   */
  private _sessionId: string;

  /**
   * @hidden
   * @internal
   */
  private _user: DomainUser;

  /**
   * @hidden
   * @internal
   */
  private _reconnectToken: string;

  /**
   * @hidden
   * @internal
   */
  constructor(domain: ConvergenceDomain,
              connection: ConvergenceConnection,
              user: DomainUser,
              sessionId: string,
              reconnectToken: string) {
    this._domain = domain;
    this._sessionId = sessionId;
    this._user = user;
    this._reconnectToken = reconnectToken;
    this._connection = connection;
  }

  /**
   * @returns The ConvergenceDomain for this session
   */
  public domain(): ConvergenceDomain {
    return this._domain;
  }

  /**
   * @returns The sessionId of the connected client
   */
  public sessionId(): string {
    return this._sessionId;
  }

  /**
   * @returns The user associated with the authenticated client or null if not authenticated
   */
  public user(): DomainUser {
    return this._user;
  }

  /**
   * @returns The reconnectToken for the authenticated client or null if not authenticated
   */
  public reconnectToken(): string {
    return this._reconnectToken;
  }

  /**
   * @returns True if the client is authenticated
   */
  public isAuthenticated(): boolean {
    return this._connection.isAuthenticated();
  }

  /**
   * @returns True if the client is connected to the domain
   */
  public isConnected(): boolean {
    return this._connection.isConnected();
  }

  /**
   * Asserts that the user is currently authenticated, throwing a [[ConvergenceError]] if not.
   */
  public assertOnline(): void {
    if (!this.isAuthenticated()) {
      const message = `Cannot perform this action while offline`;
      throw new ConvergenceError(message, ConvergenceErrorCodes.OFFLINE);
    }
  }

  /**
   * @hidden
   * @internal
   */
  public _setSessionId(sessionId: string): void {
    this._sessionId = sessionId;
  }

  /**
   * @hidden
   * @internal
   */
  public _setUser(user: DomainUser): void {
    this._user = user;
  }

  /**
   * @hidden
   * @internal
   */
  public _setReconnectToken(reconnectToken: string): void {
    this._reconnectToken = reconnectToken;
  }

}
