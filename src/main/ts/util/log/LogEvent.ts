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
