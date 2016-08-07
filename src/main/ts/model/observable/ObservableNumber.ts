import {ObservableValue, ValueChangedEvent} from "./ObservableValue";

export interface ObservableNumber extends ObservableValue<number> {

}

export interface NumberSetValueEvent extends ValueChangedEvent {
  src: ObservableNumber;
  value:  number;
}

export interface NumberAddEvent extends ValueChangedEvent {
  src: ObservableNumber;
  value:  number;
}
