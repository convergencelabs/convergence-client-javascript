import {Session} from "../../Session";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalElement} from "./HistoricalElement";

export declare class HistoricalModel {

  session(): Session;

  collectionId(): string;

  modelId(): string;

  /**
   * The version the model is currently in.
   */
  version(): number;

  /**
   * The minimum version of the model. Normally 0 unless the history has been truncated.
   */
  minVersion(): number;

  /**
   * The maximum version available for this model.
   */
  maxVersion(): number;

  /**
   * The time of the last change to the model.
   */
  time(): Date;

  /**
   * The minimum time of the model. Normally the created time unless the history has been truncated.
   */
  minTime(): Date;

  /**
   * The maximum time of the model, when it was last modified.
   */
  maxTime(): Date;

  /**
   * The time the model was created.
   */
  createdTime(): Date;

  root(): HistoricalObject;

  elementAt(path: any): HistoricalElement<any>;

  playTo(version: number): Promise<void>;

  forward(delta?: number): Promise<void>;

  backward(delta?: number): Promise<void>;
}
