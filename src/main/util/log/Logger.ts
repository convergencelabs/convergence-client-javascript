/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {LogLevel} from "./LogLevel";
import {LogWriter} from "./LogWriter";
import {LogEvent} from "./LogEvent";
import {TypeChecker} from "../TypeChecker";

/**
 * @hidden
 * @internal
 */
const LogLevelPriority: { [key: string]: number } = {
  SILENT: -1,
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4
};

/**
 * Represents log message content. A log message can either be provided as a
 * string, or as a callback that produces a string. The callback will only be
 * called when it is certain that the log message will be printed out, avoiding
 * unnecessary concatenation or other expensive operations.
 *
 * @hidden
 * @internal
 */
export type LogMessage = string | (() => string);

/**
 * @hidden
 * @internal
 */
export class Logger {
  private readonly _id: string;
  private _level: LogLevel;
  private _levelPriority: number;
  private _logWriters: LogWriter[];

  constructor(id: string, level: LogLevel, logWriters: LogWriter[]) {
    this._id = id;
    this._logWriters = logWriters;
    this.setLevel(level);
  }

  public getId(): string {
    return this._id;
  }

  public getLevel(): LogLevel {
    return this._level;
  }

  public setLevel(logLevel: LogLevel): void {
    this._level = logLevel;
    this._levelPriority = LogLevelPriority[this._level.toUpperCase()];
  }

  public trace(message: LogMessage): void {
    if (LogLevelPriority.TRACE >= this._levelPriority) {
      const event = new LogEvent(new Date(), this._id, LogLevel.TRACE, this._resolveLogMessage(message));
      this._log(event);
    }
  }

  public debug(message: LogMessage): void {
    if (LogLevelPriority.DEBUG >= this._levelPriority) {
      const event = new LogEvent(new Date(), this._id, LogLevel.DEBUG, this._resolveLogMessage(message));
      this._log(event);
    }
  }

  public info(message: LogMessage): void {
    if (LogLevelPriority.INFO >= this._levelPriority) {
      const event = new LogEvent(new Date(), this._id, LogLevel.INFO, this._resolveLogMessage(message));
      this._log(event);
    }
  }

  public warn(message: LogMessage): void {
    if (LogLevelPriority.WARN >= this._levelPriority) {
      const event = new LogEvent(new Date(), this._id, LogLevel.WARN, this._resolveLogMessage(message));
      this._log(event);
    }
  }

  public error(message: LogMessage, e?: Error): void {
    if (LogLevelPriority.ERROR >= this._levelPriority) {
      const event = new LogEvent(new Date(), this._id, LogLevel.ERROR, this._resolveLogMessage(message), e);
      this._log(event);
    }
  }

  private _log(event: LogEvent) {
    this._logWriters.forEach(writer => writer.writeLog(event));
  }

  private _resolveLogMessage(message: LogMessage): string {
    if (TypeChecker.isFunction(message)) {
      return message();
    } else {
      return message;
    }
  }
}
