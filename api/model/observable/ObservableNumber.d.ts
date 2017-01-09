import {ObservableElement, ObservableElementEvents} from "./ObservableElement";

export interface ObservableNumberEvents extends ObservableElementEvents {
  readonly DELTA: string;
}

export const ObservableNumberEventConstants: ObservableNumberEvents;

export interface ObservableNumber extends ObservableElement<number> {

}
