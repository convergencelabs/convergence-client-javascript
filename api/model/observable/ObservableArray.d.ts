import {ObservableElement, ObservableElementEvents} from "./ObservableElement";
import {ObservableContainerElement} from "./ObservableContainerElement";

export interface ObservableArrayEvents extends ObservableElementEvents {
  INSERT: string;
  REMOVE: string;
  SET: string;
  REORDER: string;
}

export interface ObservableArray extends ObservableContainerElement<any[]> {
  get(index: number): ObservableElement<any>;

  length(): number;

  forEach(callback: (value: ObservableElement<any>, index?: number) => void): void;

  elementAt(pathArgs: any): ObservableElement<any>;
}
