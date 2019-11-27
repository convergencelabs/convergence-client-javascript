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

/**
 * Convergence is an engine for realtime collaboration, which implies
 * connectivity to both a central service and likely other users. Similarly,
 * authenticated usage is almost always desired for identification, authorization
 * and consistency advantages.
 *
 * The [[Convergence]] class is the entrance point for most usages.
 *
 * @moduledefinition Connection and Authentication
 */

import {ConvergenceDomain} from "./ConvergenceDomain";
import {IConvergenceOptions} from "./IConvergenceOptions";
import {CancellationToken, ILoggingConfigData} from "./util";
import {IUsernameAndPassword} from "./IUsernameAndPassword";
import {Logging} from "./util/log/Logging";

/**
 * This is the entry point for the Convergence JS client. It allows users to connect
 * to the Convergence Engine using a variety of authentication methods. On success,
 * each connection method returns a [[ConvergenceDomain]] bound to the
 * [Domain](https://docs.convergence.io/guide/domain/overview.html) at the specified URL.
 *
 * See the [Developer Guide](https://docs.convergence.io/guide/authentication/overview.html)
 * for more information about authentication options.
 */
export class Convergence {
  /**
   * Connects to a Convergence Domain using username / password authentication.
   *
   * @param url
   *   The URL of the Convergence Domain to connect to.
   * @param username
   *   The username of the Convergence Domain User to connect as.
   * @param password
   *   The password for the corresponding Convergence Domain User.
   * @param options
   *   Options that configure the behavior of the client.
   * @param cancellationToken
   *   Allow the user to bind a callback to cancel the connection.
   *
   * @returns
   *   A Promise which will be resolved with the [[ConvergenceDomain]] upon
   *   successful connection.
   *
   * @deprecated
   *   Use connectWithPassword instead.
   */
  public static connect(url: string,
                        username: string,
                        password: string,
                        options?: IConvergenceOptions,
                        cancellationToken?: CancellationToken): Promise<ConvergenceDomain> {
    return Convergence.connectWithPassword(url, {username, password}, options, cancellationToken);
  }

  /**
   * Connects to a Convergence Domain using username / password authentication.
   *
   * @param url
   *   The URL of the Convergence Domain to connect to.
   * @param credentials
   *   The username and password of the Convergence Domain User to connect as.
   * @param options
   *   Options that configure the behavior of the client.
   * @param cancellationToken
   *   Allow the user to bind a callback to cancel the connection.
   *
   * @returns
   *   A Promise which will be resolved with the [[ConvergenceDomain]] upon
   *   successful connection.
   */
  public static connectWithPassword(url: string,
                                    credentials: IUsernameAndPassword | (() => Promise<IUsernameAndPassword>),
                                    options?: IConvergenceOptions,
                                    cancellationToken?: CancellationToken): Promise<ConvergenceDomain> {
    const domain = Convergence._createDomain(url, options, cancellationToken);
    return domain.connectWithPassword(credentials).then(() => domain);
  }

  /**
   * Connects to a Convergence Domain using anonymous authentication.  For this to
   * work, the domain must be configured to allow anonymous authentication.
   *
   * @param url
   *   The URL of the Convergence Domain to connect to.
   * @param displayName
   *   The display name to use for the anonymous user.
   * @param options
   *   Options that configure the behavior of the client.
   * @param cancellationToken
   *   Allow the user to bind a callback to cancel the connection.
   *
   * @returns
   *   A Promise which will be resolved with the [[ConvergenceDomain]] upon
   *   successful connection.
   */
  public static connectAnonymously(url: string,
                                   displayName?: string | (() => Promise<string>),
                                   options?: IConvergenceOptions,
                                   cancellationToken?: CancellationToken): Promise<ConvergenceDomain> {
    const domain = Convergence._createDomain(url, options, cancellationToken);
    return domain.connectAnonymously(displayName).then(() => domain);
  }

  /**
   * Connects to a Convergence Domain using a JSON Web Token (JWT) for
   * authentication. See the [developer guide](https://docs.convergence.io/guide/authentication/json-web-tokens.html)
   * for information about configuring the server to accept JWTs.
   *
   * @param url
   *   The URL of the Convergence Domain to connect to.
   * @param jwt
   *   A valid JSON Web Token (JWT) indicating the Domain User to connect as.
   * @param options
   *   Options that configure the behavior of the client.
   * @param cancellationToken
   *   Allow the user to bind a callback to cancel the connection.
   *
   * @returns
   *   A Promise which will be resolved with the [[ConvergenceDomain]] upon
   *   successful connection.
   */
  public static connectWithJwt(url: string,
                               jwt: string | (() => Promise<string>),
                               options?: IConvergenceOptions,
                               cancellationToken?: CancellationToken): Promise<ConvergenceDomain> {
    const domain = Convergence._createDomain(url, options, cancellationToken);
    return domain.connectWithJwt(jwt).then(() => domain);
  }

  /**
   * Reconnects to the specified domain using a previously generated reconnect
   * token (which can be obtained from an existing [[ConvergenceSession]]).
   *
   * @param url
   *   The URL of the Convergence Domain to connect to
   * @param token
   *   The reconnect token to use for authentication
   * @param options
   *   Options that configure the behavior of the client.
   * @param cancellationToken
   *   Allow the user to bind a callback to cancel the connection.
   *
   * @returns
   *   A Promise which will be resolved with the [[ConvergenceDomain]] upon
   *   successful connection.
   */
  public static reconnect(url: string,
                          token: string,
                          options?: IConvergenceOptions,
                          cancellationToken?: CancellationToken): Promise<ConvergenceDomain> {
    const domain = Convergence._createDomain(url, options, cancellationToken);
    return domain.reconnect(token).then(() => domain);
  }

  /**
   * Allows customization of both the root (default) logger and any ancillary loggers.
   *
   * ```javascript
   * Convergence.configureLogging({
   *   root: LogLevel.ERROR,
   *   loggers: {
   *     "connection": LogLevel.DEBUG
   *   }
   * });
   * ```
   *
   * The available loggers (and where / how they are used) are:
   *
   * - "connection" (Connection and authentication messages)
   * - "protocol.messages" (All messages to/from the server)
   * - "protocol.ping" (All ping/pong messages to/from the server)
   * - "heartbeat" (Heartbeat messages)
   * - "activities.activity" ([[Activity]])
   * - "activities.service" ([[ActivityService]])
   * - "models" ([[ModelService]], [[RealTimeModel]])
   * - "storage" (Offline store)
   *
   * @param config the log levels for the root logger and any other loggers.
   */
  public static configureLogging(config: ILoggingConfigData): void {
    Logging.configure(config);
  }

  /**
   * @internal
   * @hidden
   */
  private static _createDomain(url: string,
                               options: IConvergenceOptions,
                               cancellationToken?: CancellationToken): ConvergenceDomain {
    const domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    if (typeof cancellationToken === "object") {
      cancellationToken._bind(() => domain.dispose());
    }
    return domain;
  }
}

/**
 * @deprecated
 *
 * @module Connection and Authentication
 */
export const connect = Convergence.connect;

/**
 * @deprecated
 *
 * @module Connection and Authentication
 */
export const connectWithPassword = Convergence.connectWithPassword;

/**
 * @deprecated
 *
 * @module Connection and Authentication
 */
export const connectAnonymously = Convergence.connectAnonymously;

/**
 * @deprecated
 *
 * @module Connection and Authentication
 */
export const connectWithJwt = Convergence.connectWithJwt;

/**
 * @deprecated
 *
 * @module Connection and Authentication
 */
export const reconnect = Convergence.reconnect;

/**
 * @deprecated
 *
 * @module Connection and Authentication
 */
export const configureLogging = Convergence.configureLogging;
