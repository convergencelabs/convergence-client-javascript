import {HistoricalElement} from "./HistoricalElement";
import {ObservableContainerElement} from "../observable/ObservableContainerElement";
import {Path, PathElement} from "../Path";

export interface HistoricalContainerElement<T> extends ObservableContainerElement<T> {
  elementAt(path: Path): HistoricalElement<any>;
  elementAt(...elements: PathElement[]): HistoricalElement<any>;
}
