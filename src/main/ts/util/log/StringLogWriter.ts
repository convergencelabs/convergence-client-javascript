import {LogWriter} from "./LogWriter";
import {LogEvent} from "./LogEvent";
import {LogLevel} from "./LogLevel";

export abstract class StringLogWriter implements LogWriter {
  private readonly _pattern: string;

  constructor(pattern: string) {
    this._pattern = pattern;
  }

  public abstract writeLog(event: LogEvent): void;

  protected _formatMessage(event: LogEvent) {
    return `${event.level.toUpperCase()} ${event.loggerName} ${event.log}`;
  }
}
