import {ObservableElement} from "./ObservableElement";

export interface ObservableContainerElement<T> extends ObservableElement<T> {
  elementAt(pathArgs: any): ObservableElement<any>;
}
