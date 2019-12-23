import {
  AuthenticatedEvent,
  AuthenticatingEvent,
  AuthenticationFailedEvent,
  CancellationToken,
  ConnectedEvent,
  ConnectingEvent,
  ConnectionFailedEvent,
  ConnectionScheduledEvent,
  Convergence,
  ConvergenceDomain,
  DisconnectedEvent,
  ErrorEvent,
  IConvergenceOptions,
  InterruptedEvent,
  LogLevel
} from "../main";
import * as WebSocket from "ws";
import {TypeChecker} from "../main/util/TypeChecker";

Convergence.configureLogging({
  root: LogLevel.INFO,
  loggers: {
    models: LogLevel.DEBUG
  }
});

const DOMAIN_URL = "ws://localhost:8080/convergence/default";
const DOMAIN_USERNAME = "test";
const DOMAIN_PASSWORD = "password";

const ANONYMOUS = false;
const DISPLAY_NAME = "test user";

const OPTIONS: IConvergenceOptions = {
  webSocket: {
    factory: (u) => new WebSocket(u, {rejectUnauthorized: false}),
    class: WebSocket
  },
  reconnect: {
    autoReconnect: true,
    fallbackAuth: (authChallenge) => {
      authChallenge.anonymous(DISPLAY_NAME);
    }
  }
};

export function createDomain(options?: IConvergenceOptions): ConvergenceDomain {
  options = options || {};
  Object.assign(options, OPTIONS);

  const domain = new ConvergenceDomain(DOMAIN_URL, options);
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

  return domain;
}

export function connect(cancellationToken?: CancellationToken): Promise<ConvergenceDomain> {
  const domain = createDomain();

  if (TypeChecker.isSet(cancellationToken)) {
    cancellationToken._bind(() => {
      domain.disconnect();
    });
  }

  if (ANONYMOUS) {
    return domain.connectAnonymously(() => Promise.resolve(DISPLAY_NAME)).then(() => domain);
  } else {
    return domain
      .connectWithPassword(() => Promise.resolve({
        username: DOMAIN_USERNAME,
        password: DOMAIN_PASSWORD
      }))
      .then(() => domain);
  }
}
