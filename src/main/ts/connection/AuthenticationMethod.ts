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
