import {ObservableElement, ObservableElementEvents} from "./ObservableElement";

export interface ObservableStringEvents extends ObservableElementEvents {
  readonly INSERT: string;
  readonly REMOVE: string;
}

export const ObservableStringEventConstants: ObservableStringEvents;

export interface ObservableString extends ObservableElement<string> {
  length(): number;
}
