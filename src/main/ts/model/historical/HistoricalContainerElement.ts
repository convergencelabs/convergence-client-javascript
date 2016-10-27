import {HistoricalElement} from "./HistoricalElement";

export interface HistoricalContainerElement<T> {
  valueAt(pathArgs: any): HistoricalElement<any>;
}
