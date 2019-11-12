/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ILoggerConfig} from "./ILoggerConfig";
import {LogLevel} from "./LogLevel";

export interface ILoggingConfigData {
  root?: ILoggerConfig | LogLevel;
  loggers?: { [key: string]: ILoggerConfig | LogLevel };
}
