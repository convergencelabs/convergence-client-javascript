import {ObservableElement, ObservableElementEvents, ObservableElementEventConstants} from "./ObservableElement";

export interface ObservableNumberEvents extends ObservableElementEvents {
  DELTA: string;
}

export const ObservableNumberEventConstants: ObservableNumberEvents = Object.assign({
  DELTA: "delta"},
  ObservableElementEventConstants
);
Object.freeze(ObservableNumberEventConstants);

export interface ObservableNumber extends ObservableElement<number> {

}
