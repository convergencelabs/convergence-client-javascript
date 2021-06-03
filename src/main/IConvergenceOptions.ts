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

import {WebSocketFactory} from "./connection/WebSocketFactory";
import {IWebSocketClass} from "./connection/IWebSocketClass";
import {IFallbackAuthChallenge} from "./IFallbackAuthChallenge";
import {IStorageAdapter} from "./storage";

/**
 * The [[IConvergenceOptions]] interface represents that options that can be
 * set within Convergence when connecting to a domain.
 *
 * See the [ConvergenceOptions](https://github.com/convergencelabs/convergence-client-javascript/blob/master/src/main/ConvergenceOptions.ts)
 * implementation for the default settings.
 *
 * @module Connection and Authentication
 */
export interface IConvergenceOptions {

  /**
   * Options that configure the connection strategy.
   */
  connection?: {
    /**
     * The maximum time in seconds to wait for a successful web socket
     * connection to be made.
     */
    timeout?: number;

    /**
     * The maximum time in seconds to wait for a successful handshake to be
     * made after the web socket connection is successful.
     */
    handshakeTimeout?: number;
  };

  /**
   * Configures the behavior of the messaging protocol subsystem.
   */
  protocol?: {
    /**
     * The timeout for a request to the server, in seconds.  Defaults to 10.
     */
    defaultRequestTimeout: number;

    /**
     * Configures the keep-alive heartbeat.
     */
    heartbeat?: {
      /**
       * Determines if the heartbeat is enabled.
       */
      enabled: boolean;

      /**
       * Configures how long the client will wait, in seconds after the last
       * message is received from the server before a ping will be sent. Defaults
       * to 5.
       */
      pingInterval?: number;

      /**
       * Specifies the time in seconds the client will wait for a response
       * from the server to a ping before considering the connection dead. Defaults
       * to 10.
       */
      pongTimeout?: number;
    };
  };

  /**
   * Options that configure how Convergence will reconnect when an established
   * connection is lost unexpectedly or when the intial connection fails.
   */
  reconnect?: {
    /**
     * Whether to automatically reconnect when the connection is unexpectedly
     * dropped. Note this setting only applies to connections that have
     * succeeded and then were lost. This setting does not apply
     * to the initial connection, or the first connection made after
     * disconnect is called on the domain. Default is true.
     */
    autoReconnect?: boolean;

    /**
     * Whether to automatically reconnect if the initial connection
     * fails. Setting this to false will prevent Convergence from
     * reconnecting automatically if the initial connection (as
     * requested by directly calling one of the connect methods), but
     * will still allow Convergence to reconnect if it was disconnected
     * unintentionally after the first connection was made. Note that
     * if a connection is successful, and then disconnect is called,
     * the subsequent call to connect will be treated as an initial
     * connection. Default is true.
     */
    autoReconnectOnInitial?: boolean;

    /**
     * The intervals to use between reconnects. This array will be sorted from
     * smallest to largest. When the largest interval is reached it will simply
     * be repeated.
     */
    reconnectIntervals?: number[];

    /**
     * The fallbackAuth method to use when a reconnect token is rejected. It
     * provides the opportunity to use a fallback method of authentication.
     *
     * ```
     * options.reconnect.fallbackAuth = (authChallenge:IFallbackAuthChallenge) => {
     *   return YourAuthenticationService.getNewJwt().then(jwt => {
     *     authChallenge.jwt(jwt);
     *   })
     * };
     * ```
     */
    fallbackAuth?: (authChallenge: IFallbackAuthChallenge) => void;
  };

  /**
   * Configures offline storage for Convergence. Several of these options are
   * required to enable offline editing of data.
   *
   * @experimental
   */
  offline?: {
    /**
     * The storage adapter to use for offline storage.
     *
     * @experimental
     */
    storage: IStorageAdapter,

    /**
     * The number of operations after which a snapshot of local offline that is
     * being edited should be taken. The default is 100.
     *
     * @experimental
     */
    modelSnapshotInterval?: number
  };

  /**
   * Options that configure how Convergence will use WebSockets.
   *
   * See the Node.js Usage section on [this page] for an example of these
   * parameters in action.
   */
  webSocket?: {
    /**
     * Defines the class / constructor that should be used to create WebSocket
     * objects. This is useful when operating in NodeJS where a library like
     * ws or isomorphic-ws can be used to provide a client side WebSocket API.
     */
    factory?: WebSocketFactory;

    /**
     * The constructor to use when creating a web socket. Essentially this is
     * class that should be used to represent the web socket.
     */
    class?: IWebSocketClass;
  };
}
