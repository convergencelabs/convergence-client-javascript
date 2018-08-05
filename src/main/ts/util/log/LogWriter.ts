import {LogEvent} from "./LogEvent";

export interface LogWriter {
  writeLog(event: LogEvent): void;
}
