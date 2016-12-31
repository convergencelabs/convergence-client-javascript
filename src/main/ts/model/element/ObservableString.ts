import {ObservableElement} from "./ObservableElement";

export interface ObservableString extends ObservableElement<string> {
  length(): number;
}
