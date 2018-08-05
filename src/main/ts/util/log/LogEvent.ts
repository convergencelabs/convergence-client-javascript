import {LogLevel} from "./LogLevel";

export class LogEvent {
  constructor(public timestamp: Date,
              public loggerName: string,
              public level: LogLevel,
              public log: any[]) {

  }
}
