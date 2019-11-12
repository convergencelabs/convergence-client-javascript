import {ILoggerConfig} from "./ILoggerConfig";
import {LogLevel} from "./LogLevel";

/**
 * Defines the complete logging configuration for Convergence.
 */
export interface ILoggingConfigData {
  root?: ILoggerConfig | LogLevel;
  loggers?: { [key: string]: ILoggerConfig | LogLevel };
}
