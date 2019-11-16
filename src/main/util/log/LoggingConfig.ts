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

import {TypeChecker} from "../TypeChecker";
import {objectForEach} from "../ObjectUtils";
import {Validation} from "../Validation";
import {ILoggerConfig} from "./ILoggerConfig";
import {ILoggingConfigData} from "./ILoggingConfigData";
import {LogLevel} from "./LogLevel";

/**
 * @hidden
 * @internal
 */
export class LoggingConfig {

  public static ROOT_LOGGER_ID = "";

  private readonly _loggers: Map<string, ILoggerConfig>;

  constructor(config: ILoggingConfigData) {
    this._loggers = new Map();

    if (TypeChecker.isSet(config.loggers)) {
      objectForEach(config.loggers, (id, loggerConfig) => {
        if (!Validation.nonEmptyString(id)) {
          throw new Error("A logger's id must be a non-empty string");
        }

        this._loggers.set(id, this._processLoggerConfig(loggerConfig));
      });
    }

    this._loggers.set(LoggingConfig.ROOT_LOGGER_ID, this._processLoggerConfig(config.root));
  }

  public resolveLoggerConfig(loggerId: string): ILoggerConfig {
    let id = loggerId;
    let logger = this._loggers.get(id);

    while (logger === undefined && id !== "") {
      const dot = id.lastIndexOf(".");
      id = id.substring(0, dot);
      logger = this._loggers.get(id);
    }

    return logger !== undefined ?
      logger :
      this._loggers.get(LoggingConfig.ROOT_LOGGER_ID);
  }

  private _processLoggerConfig(config: ILoggerConfig | LogLevel): ILoggerConfig {
    if (TypeChecker.isString(config)) {
      return {level: config};
    } else {
      return config;
    }
  }
}
