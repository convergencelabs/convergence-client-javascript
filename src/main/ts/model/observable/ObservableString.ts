import {ObservableElement, ObservableElementEvents, ObservableElementEventConstants} from "./ObservableElement";

export interface ObservableStringEvents extends ObservableElementEvents {
  readonly INSERT: string;
  readonly REMOVE: string;
}

export const ObservableStringEventConstants: ObservableStringEvents = {
  INSERT: "insert",
  REMOVE: "remove",
  ...ObservableElementEventConstants
};
Object.freeze(ObservableStringEventConstants);

export interface ObservableString extends ObservableElement<string> {
  length(): number;
}
