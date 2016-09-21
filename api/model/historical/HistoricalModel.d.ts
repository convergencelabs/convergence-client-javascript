import {Session} from "../../Session";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalValue} from "./HistoricalValue";

export declare class HistoricalModel {

  collectionId(): string;

  modelId(): string;

  version(): number;

  maxVersion(): number;

  root(): HistoricalObject;

  goto(version: number): Promise<void>;

  forward(delta?: number): Promise<void>;

  backward(delta?: number): Promise<void>;

  createdTime(): Date;

  modifiedTime(): Date;

  valueAt(path: any): HistoricalValue<any>;

  session(): Session;
}
