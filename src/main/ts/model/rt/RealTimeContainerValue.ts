import {RealTimeValue} from "./RealTimeValue";

export interface RealTimeContainerValue<T> {
  valueAt(pathArgs: any): RealTimeValue<T>;
}
