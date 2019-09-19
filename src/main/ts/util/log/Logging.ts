import {Logger} from "./Logger";
import {LoggingConfig} from "./LoggingConfig";
import {ConsoleLogWriter} from "./ConsoleLogWriter";
import {LogLevel} from "./LogLevel";
import {ILoggingConfigData} from "./ILoggingConfigData";

const DEFAULT_CONFIG: ILoggingConfigData =  {
  root: {
    level: LogLevel.WARN
  }
};

/**
 * A flexible class for configuring the logging within Convergence.  Currently only
 * supports customization of verbosity ([[LogLevel]]).
 *
 * A single instance of this is exported as [[Logging]].  Use that rather than
 * instantiating new instances of this class.
 *
 * By default, [[LogLevel.WARN]] messages are written to the console.
 */
export class ConvergenceLogging {

  private _config: LoggingConfig;
  private _loggers: Map<string, Logger>;
  private readonly _writer: ConsoleLogWriter;

  /**
   * @hidden
   * @internal
   */
  constructor(config?: ILoggingConfigData) {
    this.configure(config || {});
    this._writer = new ConsoleLogWriter("");
  }

  /**
   * Allows customization of both the root (default) logger and any ancillary loggers.
   *
   * ```javascript
   * Logging.configure({
   *   root: LogLevel.DEBUG
   * });
   * ```
   *
   * @param config the log levels for the root logger and any other loggers.
   */
  public configure(config: ILoggingConfigData): void {
    const defaulted = {...DEFAULT_CONFIG, ...config};
    this._config = new LoggingConfig(defaulted);
    this._loggers = new Map<string, Logger>();
  }

  /**
   * @hidden
   * @internal
   */
  public root(): Logger {
    return this.logger();
  }

  /**
   * @hidden
   * @internal
   */
  public logger(id?: string): Logger {
    if (id === null || id === undefined) {
      id = LoggingConfig.ROOT_LOGGER_ID;
    }

    if (!this._loggers.has(id)) {
      const config = this._config.resolveLoggerConfig(id);
      this._loggers.set(id, new Logger(id, config.level, [this._writer]));
    }

    return this._loggers.get(id);
  }
}

/**
 * The exported single global instance of `ConvergenceLogging`.  Interface with this
 * to customize logging.
 */
export const Logging = new ConvergenceLogging();
