import {ObservableElement, ObservableElementEvents} from "./ObservableElement";

export interface ObservableStringEvents extends ObservableElementEvents {
  readonly INSERT: string;
  readonly REMOVE: string;
}

export interface ObservableString extends ObservableElement<string> {
  length(): number;
}
