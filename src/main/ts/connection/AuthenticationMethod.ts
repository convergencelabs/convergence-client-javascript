/**
 * The methods of authentication supported by Convergence.
 *
 * @module ConnectionAndAuthentication
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
 * @module ConnectionAndAuthentication
 */
export type AuthenticationMethod =
  AuthenticationMethods.ANONYMOUS |
  AuthenticationMethods.PASSWORD |
  AuthenticationMethods.JWT |
  AuthenticationMethods.RECONNECT;
