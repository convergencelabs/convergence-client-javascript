import {ObservableElement} from "./ObservableElement";
import {Path, PathElement} from "../Path";

/**
 * @module RealTimeData
 */
export interface ObservableContainerElement<T> extends ObservableElement<T> {
  elementAt(path: Path): ObservableElement<any>;
  elementAt(...elements: PathElement[]): ObservableElement<any>;
}
