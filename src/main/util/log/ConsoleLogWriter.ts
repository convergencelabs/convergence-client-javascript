/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
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
