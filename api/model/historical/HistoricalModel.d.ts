import {Session} from "../../Session";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalElement} from "./HistoricalElement";

export declare class HistoricalModel {

  session(): Session;

  collectionId(): string;

  modelId(): string;

  version(): number;

  time(): Date;

  minVersion(): number;
  maxVersion(): number;

  createdTime(): Date;

  lastModifiedTime(): Date;

  root(): HistoricalObject;

  elementAt(path: any): HistoricalElement<any>;

  playTo(version: number): Promise<void>;

  forward(delta?: number): Promise<void>;

  backward(delta?: number): Promise<void>;
}
