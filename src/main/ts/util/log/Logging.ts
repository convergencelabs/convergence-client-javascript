import {LogLevel} from "./LogLevel";
import {Logger} from "./Logger";
import {LogWriter} from "./LogWriter";
import {ILoggingConfigData, LoggingConfig} from "./LoggingConfig";

/**
 * @hidden
 * @internal
 */
export class Logging {

  private readonly _config: LoggingConfig;

  private readonly _loggers: Map<string, Logger>;
  private readonly _writers: Map<string, LogWriter>;

  constructor(config: ILoggingConfigData) {
    this._config = new LoggingConfig(config);
    this._loggers = new Map<string, Logger>();
    this._writers = new Map<string, LogWriter>();

    const writerConfig = this._config.getWriters();
    writerConfig.forEach((cfg, id) => {

    });
  }

  public getLogger(id?: string): Logger {
    if (id === null || id === undefined) {
      id = "";
    }

    if (!this._loggers.has(id)) {
      // this._loggers.set(id, new Logger(id, Logging.DEFAULT_LOG_LEVEL, []));
    }

    return this._loggers.get(id);
  }

  public setDefaultLogLevel(logLevel: LogLevel): void {
    // this._rootLogger.setLevel(logLevel);
  }
}
