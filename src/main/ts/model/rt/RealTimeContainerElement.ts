import {RealTimeElement} from "./RealTimeElement";
import {ObservableContainerElement} from "../element/ObservableContainerElement";

export interface RealTimeContainerElement<T> extends ObservableContainerElement<T> {
  elementAt(pathArgs: any): RealTimeElement<T>;
}
