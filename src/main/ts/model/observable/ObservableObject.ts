import {ObservableElement, ObservableElementEvents, ObservableElementEventConstants} from "./ObservableElement";
import {ObservableContainerElement} from "./ObservableContainerElement";
import {Path, PathElement} from "../Path";
import {RealTimeElement} from "../rt/RealTimeElement";

export interface ObservableObjectEvents extends ObservableElementEvents {
  readonly SET: string;
  readonly REMOVE: string;
}

export const ObservableObjectEventConstants: ObservableObjectEvents = Object.assign({
    SET: "set",
    REMOVE: "remove"
  },
  ObservableElementEventConstants);
Object.freeze(ObservableObjectEventConstants);

export interface ObservableObject extends ObservableContainerElement<{[key: string]: any}> {

  get(key: string): ObservableElement<any>;

  keys(): string[];

  hasKey(key: string): boolean;

  forEach(callback: (model: ObservableElement<any>, key?: string) => void): void;
}
