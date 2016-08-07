import {ObservableValue, ValueChangedEvent} from "./ObservableValue";

export interface ObservableString extends ObservableValue<String> {
  length(): number;
}

export interface StringInsertEvent extends ValueChangedEvent {
  src: ObservableString;
  index: number;
  value:  string;
}

export interface StringRemoveEvent extends ValueChangedEvent {
  src: ObservableString;
  index: number;
  value:  string;
}

export interface StringSetValueEvent extends ValueChangedEvent {
  src: ObservableString;
  value:  string;
}
