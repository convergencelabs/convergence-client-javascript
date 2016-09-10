import {ObservableValue, ValueChangedEvent} from "./ObservableValue";
import {RealTimeBoolean} from "../rt/RealTimeBoolean";

export interface ObservableBoolean extends ObservableValue<boolean> {

}

export interface BooleanSetValueEvent extends ValueChangedEvent {
  src: RealTimeBoolean;
  value:  boolean;
}
