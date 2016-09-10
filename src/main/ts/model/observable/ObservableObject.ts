import {ObservableValue, ValueChangedEvent} from "./ObservableValue";
import {ObservableContainerValue} from "./ObservableContainerValue";
import {RealTimeObject} from "../rt/RealTimeObject";

export interface ObservableObject extends ObservableContainerValue<{ [key: string]: any; }> {

  get(key: string): ObservableValue<any>;

  keys(): string[];

  hasKey(key: string): boolean;

  forEach(callback: (value: ObservableValue<any>, key?: string) => void): void;
}

export interface ObjectSetEvent extends ValueChangedEvent {
  src: RealTimeObject;
  key: string;
  value: any;
}

export interface ObjectRemoveEvent extends ValueChangedEvent {
  src: RealTimeObject;
  key: string;
}

export interface ObjectSetValueEvent extends ValueChangedEvent {
  src: RealTimeObject;
  value: { [key: string]: any; };
}
