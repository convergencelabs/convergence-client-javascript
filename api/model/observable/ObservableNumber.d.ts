import {ObservableElement, ObservableElementEvents} from "./ObservableElement";

export interface ObservableNumberEvents extends ObservableElementEvents {
  DELTA: string;
}

export interface ObservableNumber extends ObservableElement<number> {

}
