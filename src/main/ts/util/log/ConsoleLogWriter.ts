import {StringLogWriter} from "./StringLogWriter";
import {LogEvent} from "./LogEvent";
import {LogLevel} from "./LogLevel";

export class ConsoleLogWriter extends StringLogWriter {
  constructor(pattern: string) {
    super(pattern);
  }

  public writeLog(event: LogEvent): void {
    switch (event.level) {
      case LogLevel.TRACE:
        this._trace(event);
        break;
      case LogLevel.DEBUG:
        this._debug(event);
        break;
      case LogLevel.INFO:
        this._info(event);
        break;
      case LogLevel.WARN:
        this._warn(event);
        break;
      case LogLevel.ERROR:
        this._error(event);
        break;
      default:
        // no-op
    }
  }

  private _trace(event: LogEvent): void {
    console.debug(this._formatMessage(event));
  }

  private _debug(event: LogEvent): void {
    console.debug(this._formatMessage(event));
  }

  private _info(event: LogEvent): void {
    console.info(this._formatMessage(event));
  }

  private _warn(event: LogEvent): void {
    console.warn(this._formatMessage(event));
  }

  private _error(event: LogEvent): void {
    console.error(this._formatMessage(event));
  }
}
