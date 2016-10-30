import {RealTimeElement} from "./RealTimeElement";

export interface RealTimeContainerElement<T> {
  elementAt(pathArgs: any): RealTimeElement<T>;
}
