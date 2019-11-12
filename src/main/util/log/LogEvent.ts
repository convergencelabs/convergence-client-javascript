/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {LogLevel} from "./LogLevel";
import {Immutable} from "../Immutable";

/**
 * @hidden
 * @internal
 */
export class LogEvent {
  constructor(public timestamp: Date,
              public logger: string,
              public level: LogLevel,
              public message: string,
              public error?: Error) {
    Immutable.make(this);
  }
}
