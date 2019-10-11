/**
 * The methods of authentication supported by Convergence.
 *
 * @category Connection and Authentication
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
 * @category Connection and Authentication
 */
export type AuthenticationMethod =
  AuthenticationMethods.ANONYMOUS |
  AuthenticationMethods.PASSWORD |
  AuthenticationMethods.JWT |
  AuthenticationMethods.RECONNECT;
