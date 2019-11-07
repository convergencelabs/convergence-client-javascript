import {ObservableElement} from "./ObservableElement";
import {Path, PathElement} from "../Path";

/**
 * @module Real Time Data
 */
export interface ObservableContainerElement<T> extends ObservableElement<T> {
  elementAt(path: Path): ObservableElement<any>;
  elementAt(...elements: PathElement[]): ObservableElement<any>;
}
