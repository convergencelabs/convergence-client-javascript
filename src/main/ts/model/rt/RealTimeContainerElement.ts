import {RealTimeElement} from "./RealTimeElement";
import {ObservableContainerElement} from "../observable/ObservableContainerElement";
import {PathElement} from "../Path";

export interface RealTimeContainerElement<T> extends ObservableContainerElement<T> {
  elementAt(pathArgs: any): RealTimeElement<T>;
  _removeChild(relPath: PathElement): void;
}
