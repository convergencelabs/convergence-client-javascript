import {ObservableContainerValue} from "./ObservableContainerValue";
import {ObservableValue, ValueChangedEvent} from "./ObservableValue";


export interface ObservableArray extends ObservableContainerValue<any[]> {

  get(index: number): ObservableValue<any>;

  length(): number;

  forEach(callback: (value: ObservableValue<any>, index?: number) => void): void;
}

export interface ArrayInsertEvent extends ValueChangedEvent {
  index: number;
  value: any;
}

export interface ArrayRemoveEvent extends ValueChangedEvent {
  index: number;
}

export interface ArraySetEvent extends ValueChangedEvent {
  index: number;
  value: any;
}

export interface ArrayReorderEvent extends ValueChangedEvent {
  fromIndex: number;
  toIndex: any;
}

export interface ArraySetValueEvent extends ValueChangedEvent {
  value: Array<any>;
}
