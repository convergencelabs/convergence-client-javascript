import {LogLevel} from "./LogLevel";
import {Logger} from "./Logger";

export class Logging {

  private static DEFAULT_LOG_LEVEL: LogLevel = LogLevel.WARN;

  private readonly _rootLogger: Logger;
  private readonly _loggers: Map<string, Logger>;

  constructor() {
    this._loggers = new Map();
    this._rootLogger = new Logger("", this);
    this._rootLogger.setLevel(Logging.DEFAULT_LOG_LEVEL);
    this._loggers.set("", this._rootLogger);
  }

  public getLogger(id?: string): Logger {
    if (id === null || id === undefined) {
      id = "";
    }

    if (!this._loggers.has(id)) {
      this._loggers.set(id, new Logger(id, this));
    }

    return this._loggers.get(id);
  }

  public setDefaultLogLevel(logLevel: LogLevel): void {
    this._rootLogger.setLevel(logLevel);
  }
}
