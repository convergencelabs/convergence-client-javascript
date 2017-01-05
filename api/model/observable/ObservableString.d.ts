import {ObservableElement, ObservableElementEvents} from "./ObservableElement";

export interface ObservableStringEvents extends ObservableElementEvents {
  INSERT: string;
  REMOVE: string;
}

export interface ObservableString extends ObservableElement<string> {
  length(): number;
}
