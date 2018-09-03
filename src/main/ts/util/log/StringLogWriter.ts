import {LogWriter} from "./LogWriter";
import {LogEvent} from "./LogEvent";

/**
 * @hidden
 * @internal
 */
export abstract class StringLogWriter implements LogWriter {
  private readonly _pattern: string;

  protected constructor(pattern: string) {
    this._pattern = pattern;
  }

  public abstract writeLog(event: LogEvent): void;

  protected _formatMessage(event: LogEvent) {
    return `${event.level} ${event.loggerName} ${event.log}`;
  }
}
