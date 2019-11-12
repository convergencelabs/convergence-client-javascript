/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {Logger} from "./Logger";
import {LoggingConfig} from "./LoggingConfig";
import {ConsoleLogWriter} from "./ConsoleLogWriter";
import {LogLevel} from "./LogLevel";
import {ILoggingConfigData} from "./ILoggingConfigData";

const DEFAULT_CONFIG: ILoggingConfigData =  {
  root: {
    level: LogLevel.WARN
  }
};

/**
 * @hidden
 * @internal
 */
export class ConvergenceLogging {

  private _config: LoggingConfig;
  private _loggers: Map<string, Logger>;
  private readonly _writer: ConsoleLogWriter;

  /**
   * @hidden
   * @internal
   */
  constructor(config?: ILoggingConfigData) {
    this.configure(config || {});
    this._writer = new ConsoleLogWriter("");
  }

  /**
   * @hidden
   * @internal
   */
  public configure(config: ILoggingConfigData): void {
    const defaulted = {...DEFAULT_CONFIG, ...config};
    this._config = new LoggingConfig(defaulted);
    this._loggers = new Map<string, Logger>();
  }

  /**
   * @hidden
   * @internal
   */
  public root(): Logger {
    return this.logger();
  }

  /**
   * @hidden
   * @internal
   */
  public logger(id?: string): Logger {
    if (id === null || id === undefined) {
      id = LoggingConfig.ROOT_LOGGER_ID;
    }

    if (!this._loggers.has(id)) {
      const config = this._config.resolveLoggerConfig(id);
      this._loggers.set(id, new Logger(id, config.level, [this._writer]));
    }

    return this._loggers.get(id);
  }
}

/**
 * The exported single global instance of `ConvergenceLogging`.  Interface with this
 * to customize logging.
 *
 * @internal
 * @hidden
 */
export const Logging = new ConvergenceLogging();
