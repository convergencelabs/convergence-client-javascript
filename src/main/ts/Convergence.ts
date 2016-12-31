import {ConvergenceDomain} from "./ConvergenceDomain";
import {ConvergenceOptions} from "./ConvergenceOptions";
import {debugFlags as flags} from "./Debug";

export class Convergence {

  public static debugFlags: any = flags;

  public static connect(url: string, username: string, password: string,
                        options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    let domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
      return domain._authenticateWithPassword(username, password);
    }).then((v) => {
      return domain;
    });
  }

  public static connectAnonymously(url: string, displayName?: string,
                                   options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    let domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
      return domain._authenticateAnonymously(displayName);
    }).then((v) => {
      return domain;
    });
  }

  public static connectWithJwt(url: string, token: string, options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    let domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
      return domain._authenticateWithToken(token);
    }).then((v) => {
      return domain;
    });
  }
}
