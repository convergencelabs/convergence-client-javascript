import {ObservableContainerValue} from "./ObservableContainerValue";
import {ObservableValue} from "./ObservableValue";


export interface ObservableArray extends ObservableContainerValue<any[]> {

  get(index: number): ObservableValue<any>;

  length(): number;

  forEach(callback: (value: ObservableValue<any>, index?: number) => void): void;
}
