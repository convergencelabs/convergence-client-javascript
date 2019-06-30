import {Logger} from "./Logger";
import {LoggingConfig} from "./LoggingConfig";
import {ConsoleLogWriter} from "./ConsoleLogWriter";
import {LogLevel} from "./LogLevel";
import {ILoggingConfigData} from "./ILoggingConfigData";

export class Logging {

  private _config: LoggingConfig;
  private _loggers: Map<string, Logger>;
  private readonly _writer: ConsoleLogWriter;

  constructor(config?: ILoggingConfigData) {
    this.configure(config || {
      root: {
        level: LogLevel.WARN
      }
    });

    this._writer = new ConsoleLogWriter("");
  }

  public configure(config: ILoggingConfigData): void {
    this._config = new LoggingConfig(config);
    this._loggers = new Map<string, Logger>();
  }

  public root(): Logger {
    return this.logger();
  }

  public logger(id?: string): Logger {
    if (id === null || id === undefined) {
      id = "";
    }

    if (!this._loggers.has(id)) {
      const config = this._config.resolveLoggerConfig(id);
      this._loggers.set(id, new Logger(id, config.level, [this._writer]));
    }

    return this._loggers.get(id);
  }
}

export const ConvergenceLogging = new Logging();
