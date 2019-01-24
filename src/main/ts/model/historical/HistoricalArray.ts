import {HistoricalElement} from "./HistoricalElement";
import {HistoricalContainerElement} from "./HistoricalContainerElement";
import {ArrayNode} from "../internal/ArrayNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ObservableArray, ObservableArrayEvents, ObservableArrayEventConstants} from "../observable/ObservableArray";
import {HistoricalModel} from "./HistoricalModel";
import {Path, PathElement} from "../Path";

export interface HistoricalArrayEvents extends ObservableArrayEvents {
}

export class HistoricalArray
  extends HistoricalElement<any[]>
  implements ObservableArray, HistoricalContainerElement<any[]> {

  public static readonly Events: HistoricalArrayEvents = ObservableArrayEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(
    delegate: ArrayNode,
    wrapperFactory: HistoricalWrapperFactory,
    model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }

  public get(index: number): HistoricalElement<any> {
    return this._wrapperFactory.wrap((this._delegate as ArrayNode).get(index));
  }

  public length(): number {
    return (this._delegate as ArrayNode).length();
  }

  public forEach(callback: (value: HistoricalElement<any>, index?: number) => void): void {
    (this._delegate as ArrayNode).forEach((modelNode, index) => {
      callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  public elementAt(path: Path): HistoricalElement<any>;
  public elementAt(...elements: PathElement[]): HistoricalElement<any>;
  public elementAt(...path: any[]): HistoricalElement<any> {
    return this._wrapperFactory.wrap((this._delegate as ArrayNode).valueAt(...path));
  }
}
