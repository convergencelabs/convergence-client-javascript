import {Session} from "../../Session";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalValue} from "./HistoricalValue";

export declare class HistoricalModel {

  session(): Session;

  collectionId(): string;

  modelId(): string;

  version(): number;

  maxVersion(): number;

  createdTime(): Date;

  modifiedTime(): Date;

  currentTime(): Date;

  root(): HistoricalObject;

  elementAt(path: any): HistoricalValue<any>;

  playTo(version: number): Promise<void>;

  forward(delta?: number): Promise<void>;

  backward(delta?: number): Promise<void>;
}
