import {ObservableValue, ValueChangedEvent} from "./ObservableValue";
import {RealTimeNumber} from "../rt/RealTimeNumber";

export interface ObservableNumber extends ObservableValue<number> {

}

export interface NumberSetValueEvent extends ValueChangedEvent {
  src: RealTimeNumber;
  value:  number;
}

export interface NumberAddEvent extends ValueChangedEvent {
  src: RealTimeNumber;
  value:  number;
}
