/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * The methods of authentication supported by Convergence.
 *
 * @module Connection and Authentication
 */
export enum AuthenticationMethods {
  ANONYMOUS = "anonymous",
  PASSWORD = "password",
  JWT = "jwt",
  RECONNECT = "reconnect"
}

/**
 * A method of authentication.  One of the [[AuthenticationMethods]].
 *
 * @module Connection and Authentication
 */
export type AuthenticationMethod =
  AuthenticationMethods.ANONYMOUS |
  AuthenticationMethods.PASSWORD |
  AuthenticationMethods.JWT |
  AuthenticationMethods.RECONNECT;
