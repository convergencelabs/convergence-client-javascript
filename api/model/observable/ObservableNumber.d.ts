import {ObservableElement, ObservableElementEvents} from "./ObservableElement";

export interface ObservableNumberEvents extends ObservableElementEvents {
  readonly DELTA: string;
}

export interface ObservableNumber extends ObservableElement<number> {

}
