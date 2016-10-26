import {Session} from "../../Session";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalValue} from "./HistoricalValue";

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

  elementAt(path: any): HistoricalValue<any>;

  playTo(version: number): Promise<void>;

  forward(delta?: number): Promise<void>;

  backward(delta?: number): Promise<void>;
}
