import {ObservableValue, ValueChangedEvent} from "./ObservableValue";

export interface ObservableBoolean extends ObservableValue<boolean> {

}

export interface BooleanSetValueEvent extends ValueChangedEvent {
  src: ObservableBoolean;
  value:  boolean;
}
