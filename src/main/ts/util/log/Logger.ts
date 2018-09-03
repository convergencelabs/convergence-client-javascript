import {LogLevel} from "./LogLevel";
import {LogWriter} from "./LogWriter";
import {LogEvent} from "./LogEvent";

/**
 * @hidden
 * @internal
 */
export class Logger {
  private readonly _id: string;
  private _level: LogLevel;
  private _logWriters: LogWriter[];

  constructor(id: string, level: LogLevel, logWriters: LogWriter[]) {
    this._id = id;
    this._level = level;
    this._logWriters = logWriters;
  }

  public getId(): string {
    return this._id;
  }

  public getLevel(): LogLevel {
    return this._level;
  }

  public setLevel(logLevel: LogLevel): void {
    this._level = logLevel;
  }

  public trace(log: string): void {
    const event = new LogEvent(new Date(), this._id, LogLevel.TRACE, [log]);
    this._log(event);
  }

  public debug(log: string): void {
    const event = new LogEvent(new Date(), this._id, LogLevel.DEBUG, [log]);
    this._log(event);
  }

  public info(log: string): void {
    const event = new LogEvent(new Date(), this._id, LogLevel.INFO, [log]);
    this._log(event);
  }

  public warn(log: string): void {
    const event = new LogEvent(new Date(), this._id, LogLevel.WARN, [log]);
    this._log(event);
  }

  public error(log: string, e?: Error): void {
    const event = new LogEvent(new Date(), this._id, LogLevel.ERROR, [log, e]);
    this._log(event);
  }

  private _log(event: LogEvent) {
    this._logWriters.forEach(writer => writer.writeLog(event));
  }
}
