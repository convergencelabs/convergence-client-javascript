import {ObservableValue, ValueChangedEvent} from "./ObservableValue";
import {ObservableContainerValue} from "./ObservableContainerValue";

export interface ObservableObject extends ObservableContainerValue<{ [key: string]: any; }> {

  get(key: string): ObservableValue<any>;

  keys(): string[];

  hasKey(key: string): boolean;

  forEach(callback: (value: ObservableValue<any>, key?: string) => void): void;
}

export interface ObjectSetEvent extends ValueChangedEvent {
  src: ObservableObject;
  key: string;
  value: any;
}

export interface ObjectRemoveEvent extends ValueChangedEvent {
  src: ObservableObject;
  key: string;
}

export interface ObjectSetValueEvent extends ValueChangedEvent {
  src: ObservableObject;
  value: { [key: string]: any; };
}
