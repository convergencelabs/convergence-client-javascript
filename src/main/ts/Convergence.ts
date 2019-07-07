import {ConvergenceDomain} from "./ConvergenceDomain";
import {IConvergenceOptions} from "./IConvergenceOptions";
import {CancellationToken, Logging} from "./util";
import {IUsernameAndPassword} from "./IUsernameAndPassword";

/**
 * The Convergence class is the main entry point into the Convergence Client.
 * It allows users to connect to the Convergence, using a variety of
 * authentication methods and will return a ConvergenceDomain configured to
 * work with a the Convergence Domain at the specified url.
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
   * Connects to a Convergence Domain using anonymous authentication.
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
   * authentication.
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
   * token.
   *
   * @param url
   *   The URL of the Convergence Domain to connect to.
   * @param token
   *   The reconnect token to use for authentication.
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
   * @internal
   * @hidden
   */
  private static _createDomain(url: string,
                               options: IConvergenceOptions,
                               cancellationToken?: CancellationToken): ConvergenceDomain {
    const domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    if (typeof cancellationToken === "object") {
      cancellationToken._bind(() => {
        domain.dispose().catch((e) =>
          Logging.root().error("Error disposing the domain on connection cancellation", e));
      });
    }
    return domain;
  }
}

/**
 * @deprecated
 */
export const connect = Convergence.connect;
export const connectWithPassword = Convergence.connectWithPassword;
export const connectAnonymously = Convergence.connectAnonymously;
export const connectWithJwt = Convergence.connectWithJwt;
export const reconnect = Convergence.reconnect;
