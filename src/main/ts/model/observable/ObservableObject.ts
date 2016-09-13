import {ObservableValue} from "./ObservableValue";
import {ObservableContainerValue} from "./ObservableContainerValue";
import {RealTimeObject} from "../rt/RealTimeObject";

export interface ObservableObject extends ObservableContainerValue<{ [key: string]: any; }> {

  get(key: string): ObservableValue<any>;

  keys(): string[];

  hasKey(key: string): boolean;

  forEach(callback: (value: ObservableValue<any>, key?: string) => void): void;
}
