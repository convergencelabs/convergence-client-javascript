import {Session} from "../../Session";
import {ObservableObject} from "./ObservableObject";
import {ObservableElement} from "./ObservableElement";

export interface ObservableModel {

  session(): Session;

  collectionId(): string;

  modelId(): string;

  time(): Date;

  minTime(): Date;

  maxTime(): Date;

  createdTime(): Date;

  version(): number;

  minVersion(): number;

  maxVersion(): number;

  root(): ObservableObject;

  elementAt(path: any): ObservableElement<any>;
}
