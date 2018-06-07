import {Session} from "../../Session";
import {ObservableObject} from "./ObservableObject";
import {ObservableElement} from "./ObservableElement";
import {Path, PathElement} from "../";

export interface ObservableModelEvents {
  readonly CLOSED: string;
  readonly DELETED: string;
  readonly VERSION_CHANGED: string;
}

export const ObservableModelEventConstants: ObservableModelEvents;

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

  elementAt(path: Path): ObservableElement<any>;
  elementAt(...elements: PathElement[]): ObservableElement<any>;
}
