import {RealTimeElement} from "./RealTimeElement";

export interface RealTimeContainerElement<T> {
  valueAt(pathArgs: any): RealTimeElement<T>;
}
