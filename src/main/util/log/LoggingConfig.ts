import {TypeChecker} from "../TypeChecker";
import {objectForEach} from "../ObjectUtils";
import {Validation} from "../Validation";
import {ILoggerConfig} from "./ILoggerConfig";
import {ILoggingConfigData} from "./ILoggingConfigData";
import {LogLevel} from "./LogLevel";

/**
 * @hidden
 * @internal
 */
export class LoggingConfig {

  public static ROOT_LOGGER_ID = "";

  private readonly _loggers: Map<string, ILoggerConfig>;

  constructor(config: ILoggingConfigData) {
    this._loggers = new Map();

    if (TypeChecker.isSet(config.loggers)) {
      objectForEach(config.loggers, (id, loggerConfig) => {
        if (!Validation.nonEmptyString(id)) {
          throw new Error("A logger's id must be a non-empty string");
        }

        this._loggers.set(id, this._processLoggerConfig(loggerConfig));
      });
    }

    this._loggers.set(LoggingConfig.ROOT_LOGGER_ID, this._processLoggerConfig(config.root));
  }

  public resolveLoggerConfig(loggerId: string): ILoggerConfig {
    let id = loggerId;
    let logger = this._loggers.get(id);

    while (logger === undefined && id !== "") {
      const dot = id.lastIndexOf(".");
      id = id.substring(0, dot);
      logger = this._loggers.get(id);
    }

    return logger !== undefined ?
      logger :
      this._loggers.get(LoggingConfig.ROOT_LOGGER_ID);
  }

  private _processLoggerConfig(config: ILoggerConfig | LogLevel): ILoggerConfig {
    if (TypeChecker.isString(config)) {
      return {level: config};
    } else {
      return config;
    }
  }
}
