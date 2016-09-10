import {HistoricalValue} from "./HistoricalValue";

export interface HistoricalContainerValue<T> {
  valueAt(pathArgs: any): HistoricalValue<any>;
}
