/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {PatternLogWriter} from "./PatternLogWriter";
import {LogEvent} from "./LogEvent";
import {LogLevel} from "./LogLevel";

/**
 * @hidden
 * @internal
 */
export class ConsoleLogWriter extends PatternLogWriter {
  constructor(pattern: string) {
    super(pattern);
  }

  public writeLog(event: LogEvent): void {
    switch (event.level) {
      case LogLevel.TRACE:
        console.debug(this._formatMessage(event));
        break;
      case LogLevel.DEBUG:
        console.debug(this._formatMessage(event));
        break;
      case LogLevel.INFO:
        console.info(this._formatMessage(event));
        break;
      case LogLevel.WARN:
        console.warn(this._formatMessage(event));
        break;
      case LogLevel.ERROR:
        console.error(this._formatMessage(event), event.error);
        break;
      default:
      // no-op
    }
  }
}
