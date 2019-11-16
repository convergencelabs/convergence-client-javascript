
/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * Provides a few hooks for passing authentication information that can be
 * provided in [[IConvergenceOptions]].  The application-provided [[IConvergenceOptions.reconnect.fallbackAuth]]
 * will be called when a domain attempts to reconnect using a reconnect token
 * but fails. This allows the application to provide authentication information
 * synchronously or asynchronously.
 *
 * @module Connection and Authentication
 */
export interface IFallbackAuthChallenge {
  /**
   * Call this to tell Convergence to reconnect using a provided password.
   *
   * See [[Convergence.connect]]
   *
   * @param password
   *   a string, a function that returns a string, or a Promise that will
   *   resolve with a string.
   */
  password(password: string | (() => string) | Promise<string>): void;

  /**
   * Call this to tell Convergence to reconnect using a provided [JWT](https://jwt.io).
   *
   * Note that the JWT must encode the same username as that of the username
   * or the user that originally connected.
   *
   * @param password
   *   an JWT, a function that returns a JWT, or a Promise that will
   *   resolve with a JWT.
   */
  jwt(jwt: string | (() => string) | Promise<string>): void;

  /**
   * Call this to tell Convergence to reconnect anonymously using the provided
   * display name.
   *
   * @param password
   *   a display name, a function that returns a display name, or a Promise
   *   that will resolve with a display name.
   */
  anonymous(displayName: string | (() => string) | Promise<string>): void;

  /**
   * Call this to tell Convergence not to reconnect.  This can be used when
   * e.g. the consuming application fails to retrieve a new JWT.
   */
  cancel(): void;
}
