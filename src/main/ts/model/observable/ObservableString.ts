import {ObservableValue} from "./ObservableValue";
import {RealTimeString} from "../rt/RealTimeString";

export interface ObservableString extends ObservableValue<String> {
  length(): number;
}
