import {ConvergenceDomain} from "./ConvergenceDomain";
import {IConvergenceOptions} from "./IConvergenceOptions";

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
   *
   * @returns
   *   A Promise which will be resolved with the [[ConvergenceDomain]] upon
   *   successful connection.
   */
  public static connect(url: string, username: string, password: string,
                        options?: IConvergenceOptions): Promise<ConvergenceDomain> {
    const domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then(() => {
      return domain._authenticateWithPassword(username, password);
    }).then(() => {
      return domain;
    });
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
   *
   * @returns
   *   A Promise which will be resolved with the [[ConvergenceDomain]] upon
   *   successful connection.
   */
  public static connectAnonymously(url: string, displayName?: string,
                                   options?: IConvergenceOptions): Promise<ConvergenceDomain> {
    const domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then(() => {
      return domain._authenticateAnonymously(displayName);
    }).then(() => {
      return domain;
    });
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
   *
   * @returns
   *   A Promise which will be resolved with the [[ConvergenceDomain]] upon
   *   successful connection.
   */
  public static connectWithJwt(url: string, jwt: string, options?: IConvergenceOptions): Promise<ConvergenceDomain> {
    const domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then(() => {
      return domain._authenticateWithToken(jwt);
    }).then(() => {
      return domain;
    });
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
   *
   * @returns
   *   A Promise which will be resolved with the [[ConvergenceDomain]] upon
   *   successful connection.
   */
  public static reconnect(url: string, token: string, options?: IConvergenceOptions): Promise<ConvergenceDomain> {
    const domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then(() => {
      return domain._authenticateWithReconnectToken(token);
    }).then(() => {
      return domain;
    });
  }
}

export const connect = Convergence.connect;
export const connectAnonymously = Convergence.connectAnonymously;
export const connectWithJwt = Convergence.connectWithJwt;
export const reconnect = Convergence.reconnect;
