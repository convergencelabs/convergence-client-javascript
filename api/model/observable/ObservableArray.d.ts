import {ObservableElement, ObservableElementEvents} from "./ObservableElement";
import {ObservableContainerElement} from "./ObservableContainerElement";

export interface ObservableArrayEvents extends ObservableElementEvents {
  readonly INSERT: string;
  readonly REMOVE: string;
  readonly SET: string;
  readonly REORDER: string;
}

export interface ObservableArray extends ObservableContainerElement<any[]> {
  get(index: number): ObservableElement<any>;

  length(): number;

  forEach(callback: (value: ObservableElement<any>, index?: number) => void): void;

  elementAt(pathArgs: any): ObservableElement<any>;
}
