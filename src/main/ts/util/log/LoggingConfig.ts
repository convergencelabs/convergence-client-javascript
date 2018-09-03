import {LogLevel} from "./LogLevel";

/**
 * @hidden
 * @internal
 */
export class LoggingConfig {
  private readonly _logWriters: Map<string, ILogWriterConfig>;
  private readonly _loggers: Map<string, ILoggerConfig>;
  private readonly _rootLogger: ILoggerConfig;

  constructor(config: ILoggingConfigData) {
    this._logWriters = new Map();
    this._loggers = new Map();
    this._rootLogger = config.rootLogger;
  }

  public rootLoggerConfig(): ILoggerConfig {
    return this._rootLogger;
  }

  public resolveLoggerConfig(loggerId: string): ILoggerConfig {
    let id = loggerId;
    let logger = this._loggers[id];

    while (logger === undefined && id !== "") {
      const dot = id.lastIndexOf(".");
      id = id.substring(0, dot);
      logger = this._loggers[id];
    }

    return logger !== undefined ?
      logger :
      this._rootLogger;
  }

  public getWriters(): Map<string, ILogWriterConfig> {
    return this._logWriters;
  }
}

/**
 * @hidden
 * @internal
 */
export interface ILoggingConfigData {
  writers: { [key: string]: ILogWriterConfig };
  rootLogger: ILoggerConfig;
  loggers: { [key: string]: ILoggerConfig };
}

/**
 * @hidden
 * @internal
 */
export interface ILogWriterConfig {
  type: string;
  options: any;
}

/**
 * @hidden
 * @internal
 */
export interface ILoggerConfig {
  level: LogLevel;
  writer: string;
}
