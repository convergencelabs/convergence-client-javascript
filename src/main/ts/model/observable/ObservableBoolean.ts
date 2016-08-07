import {ObservableValue, ValueChangedEvent} from "./ObservableValue";

export default class ObservableBoolean extends ObservableValue<boolean> {

}

export interface BooleanSetValueEvent extends ValueChangedEvent {
  src: ObservableBoolean;
  value:  boolean;
}
