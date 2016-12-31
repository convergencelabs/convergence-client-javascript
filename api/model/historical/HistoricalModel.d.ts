import {Session} from "../../Session";
import {HistoricalObject} from "./HistoricalObject";
import {HistoricalElement} from "./HistoricalElement";
import {ObservableModel} from "../observable/ObservableModel";

export declare class HistoricalModel implements ObservableModel {

  public session(): Session;

  public collectionId(): string;

  public modelId(): string;

  /**
   * The version the model is currently in.
   */
  public version(): number;

  /**
   * The minimum version of the model. Normally 0 unless the history has been truncated.
   */
  public minVersion(): number;

  /**
   * The maximum version available for this model.
   */
  public maxVersion(): number;

  /**
   * The time of the last change to the model.
   */
  public time(): Date;

  /**
   * The minimum time of the model. Normally the created time unless the history has been truncated.
   */
  public minTime(): Date;

  /**
   * The maximum time of the model, when it was last modified.
   */
  public maxTime(): Date;

  /**
   * The time the model was created.
   */
  public createdTime(): Date;

  public root(): HistoricalObject;

  public elementAt(path: any): HistoricalElement<any>;

  public playTo(version: number): Promise<void>;

  public forward(delta?: number): Promise<void>;

  public backward(delta?: number): Promise<void>;
}
