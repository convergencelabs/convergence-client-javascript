import { HistoricalElement } from "./HistoricalElement";
import { ObjectNode } from "../internal/ObjectNode";
import { HistoricalWrapperFactory } from "./HistoricalWrapperFactory";
import { HistoricalContainerElement } from "./HistoricalContainerElement";
import {
  ObservableObject,
  ObservableObjectEvents,
  ObservableObjectEventConstants
} from "../observable/ObservableObject";
import {HistoricalModel} from "./HistoricalModel";
import {Path, PathElement} from "../Path";

export interface HistoricalObjectEvents extends ObservableObjectEvents {
}

export class HistoricalObject extends HistoricalElement<{[key: string]: any}>
                              implements HistoricalContainerElement<{[key: string]: any}>, ObservableObject {

  public static readonly Events: HistoricalObjectEvents = ObservableObjectEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: ObjectNode, wrapperFactory: HistoricalWrapperFactory, model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }

  public get(key: string): HistoricalElement<any> {
    return this._wrapperFactory.wrap((this._delegate as ObjectNode).get(key));
  }

  public keys(): string[] {
    return (this._delegate as ObjectNode).keys();
  }

  public hasKey(key: string): boolean {
    return (this._delegate as ObjectNode).hasKey(key);
  }

  public forEach(callback: (model: HistoricalElement<any>, key?: string) => void): void {
    (this._delegate as ObjectNode).forEach((modelNode, key) => {
      callback(this._wrapperFactory.wrap(modelNode), key);
    });
  }

  public elementAt(path: Path): HistoricalElement<any>;
  public elementAt(...elements: PathElement[]): HistoricalElement<any>;
  public elementAt(...path: any[]): HistoricalElement<any> {
    return this._wrapperFactory.wrap((this._delegate as ObjectNode).valueAt(...path));
  }
}
