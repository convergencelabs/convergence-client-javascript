import {HistoricalElement} from "./HistoricalElement";
import {ObservableContainerElement} from "../observable/ObservableContainerElement";
import {Path, PathElement} from "../Path";

/**
 * An abstraction representing a unified type for an [[HistoricalObject]] and [[HistoricalArray]].
 *
 * @module Real Time Data
 */
export interface HistoricalContainerElement<T> extends ObservableContainerElement<T> {
  /**
   * See [[HistoricalModel.elementAt]]
   *
   * @param path the query instructions leading to the desired element
   */
  elementAt(path: Path): HistoricalElement<any>;
  elementAt(...elements: PathElement[]): HistoricalElement<any>;
}
