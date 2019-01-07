import {ObservableElement, ObservableElementEvents, ObservableElementEventConstants} from "./ObservableElement";

export interface ObservableNumberEvents extends ObservableElementEvents {
  readonly DELTA: string;
}

export const ObservableNumberEventConstants: ObservableNumberEvents = {
  DELTA: "delta",
  ...ObservableElementEventConstants
};

Object.freeze(ObservableNumberEventConstants);

export interface ObservableNumber extends ObservableElement<number> {

}
