import {RealTimeValue} from "./RealTimeValue";
export interface RealTimeContainerValue<T> {
  elementAt(pathArgs: any): RealTimeValue<T>;
}
