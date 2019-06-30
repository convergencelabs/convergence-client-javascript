import {ILoggerConfig} from "./ILoggerConfig";

export interface ILoggingConfigData {
  root: ILoggerConfig;
  loggers?: { [key: string]: ILoggerConfig };
}
