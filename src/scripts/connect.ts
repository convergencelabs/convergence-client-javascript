import Convergence, {
  ConvergenceDomain,
  IConvergenceOptions,
  CancellationToken,
  ConnectionScheduledEvent,
  ConnectingEvent,
  ConnectionFailedEvent,
  AuthenticatingEvent,
  AuthenticationFailedEvent,
  AuthenticatedEvent,
  DisconnectedEvent,
  InterruptedEvent,
  ErrorEvent, ConnectedEvent
} from "../main/ts";
import * as WebSocket from "ws";

const DOMAIN_URL = "ws://localhost:8080/convergence/default";
const DOMAIN_USERNAME = "test1";
const DOMAIN_PASSWORD = "password";

const ANONYMOUS = true;
const DISPLAY_NAME = "test user";

const OPTIONS: IConvergenceOptions = {
  webSocket: {
    factory: (u) => new WebSocket(u, {rejectUnauthorized: false}),
    constructor: WebSocket
  },
  reconnect: {
    autoReconnect: true
  }
};

const domain = new ConvergenceDomain(DOMAIN_URL, OPTIONS);
domain.events().subscribe((event) => {
    if (event instanceof ConnectionScheduledEvent) {
      console.log(`Connection scheduled in ${event.delay} seconds`);
    } else if (event instanceof ConnectingEvent) {
      console.log(`Connecting to: ${domain.url()}`);
    } else if (event instanceof ConnectionFailedEvent) {
      console.log(`Connection failed`);
    } else if (event instanceof ConnectedEvent) {
      console.log(`Connected to ${event.domain.namespace()}/${event.domain.id()}`);
    } else if (event instanceof AuthenticatingEvent) {
      console.log(`Authenticating {method: "${event.method}"}`);
    } else if (event instanceof AuthenticationFailedEvent) {
      console.log(`Authentication failed {method: "${event.method}"}`);
    } else if (event instanceof AuthenticatedEvent) {
      console.log(`Authenticated {method: "${event.method}"}`);
    } else if (event instanceof DisconnectedEvent) {
      console.log(`Disconnected`);
    } else if (event instanceof InterruptedEvent) {
      console.log(`Interrupted`);
    } else if (event instanceof ErrorEvent) {
      console.log(`Error: ${event.error}`);
    }
  }
);

export function connect(cancellationToken?: CancellationToken): Promise<ConvergenceDomain> {
  if (ANONYMOUS) {
    return domain.connectAnonymously(DISPLAY_NAME).then(() => domain);
  } else {
    return domain.connectWithPassword(DOMAIN_USERNAME, DOMAIN_PASSWORD).then(() => domain);
  }
}
