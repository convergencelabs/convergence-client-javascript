import {ObservableElement, ObservableElementEvents} from "./ObservableElement";
import {ObservableContainerElement} from "./ObservableContainerElement";
import {Path, PathElement} from "../";

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

  elementAt(path: Path): ObservableElement<any>;
  elementAt(...elements: PathElement[]): ObservableElement<any>;
}
