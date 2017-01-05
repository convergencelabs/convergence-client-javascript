import {ObservableElement, ObservableElementEvents} from "./ObservableElement";
import {ObservableContainerElement} from "./ObservableContainerElement";

export interface ObservableObjectEvents extends ObservableElementEvents {
  SET: string;
  REMOVE: string;
}

export interface ObservableObject extends ObservableContainerElement<{[key: string]: any}> {

  get(key: string): ObservableElement<any>;

  keys(): string[];

  hasKey(key: string): boolean;

  forEach(callback: (model: ObservableElement<any>, key?: string) => void): void;

  elementAt(pathArgs: any): ObservableElement<any>;
}
