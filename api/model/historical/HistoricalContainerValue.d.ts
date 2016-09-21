import {HistoricalValue} from "./HistoricalValue";
export interface HistoricalContainerValue<T> {
  elementAt(pathArgs: any): HistoricalValue<any>;
}
