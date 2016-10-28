import {HistoricalElement} from "./HistoricalElement";

export interface HistoricalContainerElement<T> {
  elementAt(pathArgs: any): HistoricalElement<any>;
}
