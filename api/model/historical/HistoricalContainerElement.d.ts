import {HistoricalElement} from "./HistoricalElement";
import {ObservableContainerElement} from "../observable/ObservableContainerElement";

export interface HistoricalContainerElement<T> extends ObservableContainerElement<T> {
  elementAt(pathArgs: any): HistoricalElement<any>;
}
