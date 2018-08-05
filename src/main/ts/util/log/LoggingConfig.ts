import {LogLevel} from "./LogLevel";
import {LogWriter} from "./LogWriter";

export class LoggingConfig {
  private _logWriters: ILogWriterConfig[];
  private _loggers: ILoggerConfig[];

  public resolveLevel(loggerId: string): LogLevel {
    return null;
  }

  public resolveWriters(loggerId: string): LogWriter[] {
    return [];
  }
}

export interface ILogWriterConfig {
  id: string;
  options: any;
}

export interface ILoggerConfig {
  id: string;
  level: LogLevel;
  writer: string;
}
