import Convergence, {ConvergenceDomain, IConvergenceOptions} from "../main/ts";
import * as WebSocket from "ws";

const DOMAIN_URL = "ws://localhost:8080/domain/test/example";
const DOMAIN_USERNAME = "test1";
const DOMAIN_PASSWORD = "password";

const ANONYMOUS = true;
const DISPLAY_NAME = "test user";

const OPTIONS: IConvergenceOptions = {
  webSocketFactory: (u) => new WebSocket(u, {rejectUnauthorized: false}),
  webSocketClass: WebSocket,
  retryOnOpen: false
};

export function connect(): Promise<ConvergenceDomain> {
  if (ANONYMOUS) {
    return Convergence.connectAnonymously(DOMAIN_URL, DISPLAY_NAME, OPTIONS);
  } else {
    return Convergence.connect(DOMAIN_URL, DOMAIN_USERNAME, DOMAIN_PASSWORD, OPTIONS);
  }
}
