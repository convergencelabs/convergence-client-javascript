import {ConvergenceDomain} from "./ConvergenceDomain";
import {ConvergenceOptions} from "./ConvergenceOptions";

/**
 * The Convergence class is the main entry point into the Convergence Client.
 * It allows users to connect to the Convergence, using a variety of
 * authentication methods and will return a ConvergenceDomain configured to
 * work with a the Convergence Domain at the specified url.
 */
export class Convergence {

  public static connect(url: string, username: string, password: string,
                        options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    const domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
      return domain._authenticateWithPassword(username, password);
    }).then(() => {
      return domain;
    });
  }

  public static connectAnonymously(url: string, displayName?: string,
                                   options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    const domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
      return domain._authenticateAnonymously(displayName);
    }).then(() => {
      return domain;
    });
  }

  public static connectWithJwt(url: string, token: string, options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    const domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
      return domain._authenticateWithToken(token);
    }).then(() => {
      return domain;
    });
  }

  public static reconnect(url: string, token: string, options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    const domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
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
