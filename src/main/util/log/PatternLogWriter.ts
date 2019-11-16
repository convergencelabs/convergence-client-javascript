/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {LogWriter} from "./LogWriter";
import {LogEvent} from "./LogEvent";

/**
 * @hidden
 * @internal
 */
export abstract class PatternLogWriter implements LogWriter {

  public static FIELDS = {
    LOG_NAME: "%l",
    MESSAGE: "%m",
    DATE_TIME: "%t",
    LOG_LEVEL: "%p"
  };

  public static DEFAULT_PATTERN = "%t %p %m";

  private readonly _pattern: string;

  protected constructor(pattern?: string) {
    this._pattern = pattern || PatternLogWriter.DEFAULT_PATTERN;
  }

  public abstract writeLog(event: LogEvent): void;

  protected _formatMessage(event: LogEvent): string {
    const level = this._pad(event.level.toUpperCase(), 5, " ", false);
    const time = this._formatTime(event);
    return `${level} ${time} ${event.message}`;
  }

  private _formatTime(event: LogEvent): string {
    const t = event.timestamp;
    return this._pad(t.getHours(), 2, "0") +
      ":" +
      this._pad(t.getMinutes(), 2, "0") +
      ":" +
      this._pad(t.getSeconds(), 2, "0") +
      "." +
      this._pad(t.getMilliseconds(), 3, "0");
  }

  private _pad(value: any, minLen: number, char: string, left = true): string {
    let str = String(value);
    while (str.length < minLen) {
      str = left ? char + str : str + char;
    }
    return str;
  }
}
