import {HistoricalElement} from "./HistoricalElement";
import {ObservableContainerElement} from "../element/ObservableContainerElement";

export interface HistoricalContainerElement<T> extends HistoricalElement<T>, ObservableContainerElement<T> {
  elementAt(pathArgs: any): HistoricalElement<any>;
}
