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
} from "../main/ts";
import * as WebSocket from "ws";
import {TypeChecker} from "../main/ts/util/TypeChecker";

Convergence.logging.configure({
  root: {
    level: LogLevel.INFO
  },
  loggers: {
    "activities.activity": {level: LogLevel.DEBUG}
  }
});

const DOMAIN_URL = "ws://localhost:8080/convergence/default";
const DOMAIN_USERNAME = "test1";
const DOMAIN_PASSWORD = "password";

const ANONYMOUS = true;
const DISPLAY_NAME = "test user";

const OPTIONS: IConvergenceOptions = {
  webSocket: {
    factory: (u) => new WebSocket(u, {rejectUnauthorized: false}),
    class: WebSocket
  },
  reconnect: {
    autoReconnect: true,
    fallbackAuth: {
      anonymous: () => Promise.resolve(DISPLAY_NAME)
    }
  }
};

export function createDomain(): ConvergenceDomain {
  const log = Convergence.logging.root();
  const domain = new ConvergenceDomain(DOMAIN_URL, OPTIONS);
  domain.events().subscribe((event) => {
      if (event instanceof ConnectionScheduledEvent) {
        log.info(`Connection scheduled in ${event.delay} seconds`);
      } else if (event instanceof ConnectingEvent) {
        log.info(`Connecting to: ${domain.url()}`);
      } else if (event instanceof ConnectionFailedEvent) {
        log.info(`Connection failed`);
      } else if (event instanceof ConnectedEvent) {
        log.info(`Connected to ${event.domain.namespace()}/${event.domain.id()}`);
      } else if (event instanceof AuthenticatingEvent) {
        log.info(`Authenticating {method: "${event.method}"}`);
      } else if (event instanceof AuthenticationFailedEvent) {
        log.info(`Authentication failed {method: "${event.method}"}`);
      } else if (event instanceof AuthenticatedEvent) {
        log.info(`Authenticated {method: "${event.method}"}`);
      } else if (event instanceof DisconnectedEvent) {
        log.info(`Disconnected`);
      } else if (event instanceof InterruptedEvent) {
        log.info(`Interrupted`);
      } else if (event instanceof ErrorEvent) {
        log.info(`Error: ${event.error}`);
      }
    }
  );

  return domain;
}

export function connect(cancellationToken?: CancellationToken): Promise<ConvergenceDomain> {
  const domain = createDomain();

  if (TypeChecker.isSet(cancellationToken)) {
    cancellationToken._bind(() => {
      domain.disconnect().catch((e) => console.error(e));
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
