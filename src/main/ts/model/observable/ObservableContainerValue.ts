import {ObservableValue} from "./ObservableValue";

export interface ObservableContainerValue<T> extends ObservableValue<T> {
  valueAt(pathArgs: any): ObservableValue<any>;
}
