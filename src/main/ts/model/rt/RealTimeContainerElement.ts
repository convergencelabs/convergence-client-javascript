import {RealTimeElement} from "./RealTimeElement";
import {ObservableContainerElement} from "../observable/ObservableContainerElement";

export interface RealTimeContainerElement<T> extends ObservableContainerElement<T> {
  elementAt(pathArgs: any): RealTimeElement<T>;
}
