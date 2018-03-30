import {ConvergenceDomain} from "./ConvergenceDomain";
import {ConvergenceOptions} from "./ConvergenceOptions";

export class Convergence {

  public static connect(url: string, username: string, password: string,
                        options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    let domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
      return domain._authenticateWithPassword(username, password);
    }).then(() => {
      return domain;
    });
  }

  public static connectAnonymously(url: string, displayName?: string,
                                   options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    let domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
      return domain._authenticateAnonymously(displayName);
    }).then(() => {
      return domain;
    });
  }

  public static connectWithJwt(url: string, token: string, options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    let domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
      return domain._authenticateWithToken(token);
    }).then(() => {
      return domain;
    });
  }

  public static reconnect(url: string, token: string): Promise<ConvergenceDomain> {
    let domain: ConvergenceDomain = new ConvergenceDomain(url);
    return domain._connect().then((response) => {
      return domain._authenticateWithReconnectToken(token);
    }).then(() => {
      return domain;
    });
  }
}

export function connect(url: string, username: string, password: string,
                        options?: ConvergenceOptions): Promise<ConvergenceDomain> {
  return Convergence.connect(url, username, password, options);
}

export function connectAnonymously(url: string, displayName?: string,
                                   options?: ConvergenceOptions): Promise<ConvergenceDomain> {
  return Convergence.connectAnonymously(url, displayName, options);
}

export function connectWithJwt(url: string, token: string, options?: ConvergenceOptions): Promise<ConvergenceDomain> {
  return Convergence.connectWithJwt(url, token, options);
}

export function reconnect(url: string, token: string): Promise<ConvergenceDomain> {
  return Convergence.reconnect(url, token);
}
