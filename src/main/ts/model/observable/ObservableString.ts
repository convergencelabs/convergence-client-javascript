import {ObservableValue, ValueChangedEvent} from "./ObservableValue";
import {RealTimeString} from "../rt/RealTimeString";

export interface ObservableString extends ObservableValue<String> {
  length(): number;
}

export interface StringInsertEvent extends ValueChangedEvent {
  src: RealTimeString;
  index: number;
  value:  string;
}

export interface StringRemoveEvent extends ValueChangedEvent {
  src: RealTimeString;
  index: number;
  value:  string;
}

export interface StringSetValueEvent extends ValueChangedEvent {
  src: RealTimeString;
  value:  string;
}
