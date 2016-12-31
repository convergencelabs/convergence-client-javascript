import {ConvergenceOptions} from "./ConvergenceOptions";
import {ConvergenceDomain} from "./ConvergenceDomain";

export class Convergence {

  public static connect(url: string,
                        username: string,
                        password: string,
                        options?: ConvergenceOptions): Promise<ConvergenceDomain>;

  public static connectWithJwt(url: string,
                               jwt: string,
                               options?: ConvergenceOptions): Promise<ConvergenceDomain>;

  public static connectAnonymously(url: string,
                                   displayName?: string,
                                   options?: ConvergenceOptions): Promise<ConvergenceDomain>;
}
