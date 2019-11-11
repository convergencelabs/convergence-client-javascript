import {LogEvent} from "./LogEvent";

/**
 * @hidden
 * @internal
 */
export interface LogWriter {
  writeLog(event: LogEvent): void;
}
