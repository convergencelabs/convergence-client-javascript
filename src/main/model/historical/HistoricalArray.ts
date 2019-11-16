/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {HistoricalElement} from "./HistoricalElement";
import {HistoricalContainerElement} from "./HistoricalContainerElement";
import {ArrayNode} from "../internal/ArrayNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ObservableArray, ObservableArrayEvents, ObservableArrayEventConstants} from "../observable/ObservableArray";
import {HistoricalModel} from "./HistoricalModel";
import {Path, PathElement} from "../Path";

/**
 * @module Real Time Data
 */
export interface HistoricalArrayEvents extends ObservableArrayEvents {
}

/**
 * A read-only history-aware version of a [[RealTimeArray]].  See [[HistoricalElement]]
 * and [[HistoricalModel]] for some common usages.
 *
 * @module Real Time Data
 */
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

  /**
   * Returns the [[HistoricalElement]] at the given index at the current version.
   *
   * Also see [[RealTimeArray.get]].
   *
   * @param index the 0-based index of the desired element.
   */
  public get(index: number): HistoricalElement<any> {
    return this._wrapperFactory.wrap((this._delegate as ArrayNode).get(index));
  }

  /**
   * Returns the total count of items in this array at the current version.
   *
   * Also see [[RealTimeArray.length]].
   */
  public length(): number {
    return (this._delegate as ArrayNode).length();
  }

  /**
   * Synchronously calls the provided callback function for each item in this array
   * at the current version.
   *
   * Also see [[RealTimeArray.forEach]].
   *
   * @param callback a function to be called for each item in this array
   */
  public forEach(callback: (value: HistoricalElement<any>, index?: number) => void): void {
    (this._delegate as ArrayNode).forEach((modelNode, index) => {
      callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  /**
   * Given a search path, returns the [[HistoricalElement]] at that path, or null if
   * no such element exists. Scoped to this array, so the first element in the given
   * path should be an array index.
   *
   * @param path the search path for accessing a node within this model's data
   *
   * @returns The [[HistoricalElement]] at the given path, or null if no such element exists
   */
  public elementAt(path: Path): HistoricalElement<any>;
  public elementAt(...elements: PathElement[]): HistoricalElement<any>;
  public elementAt(...path: any[]): HistoricalElement<any> {
    return this._wrapperFactory.wrap((this._delegate as ArrayNode).valueAt(...path));
  }
}
