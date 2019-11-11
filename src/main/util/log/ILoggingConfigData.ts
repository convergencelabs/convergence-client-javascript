import {ILoggerConfig} from "./ILoggerConfig";
import {LogLevel} from "./LogLevel";

export interface ILoggingConfigData {
  root?: ILoggerConfig | LogLevel;
  loggers?: { [key: string]: ILoggerConfig | LogLevel };
}
