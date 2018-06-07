import {RealTimeElement} from "./RealTimeElement";
import {ObservableContainerElement} from "../observable/ObservableContainerElement";
import {Path, PathElement} from "../";

export interface RealTimeContainerElement<T> extends ObservableContainerElement<T> {
  elementAt(path: Path): RealTimeElement<any>;
  elementAt(...elements: PathElement[]): RealTimeElement<any>;
}
