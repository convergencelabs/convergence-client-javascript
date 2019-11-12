/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {HistoricalElement} from "./HistoricalElement";
import {HistoricalContainerElement} from "./HistoricalContainerElement";
import {ArrayNode} from "../internal/ArrayNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ObservableArray, ObservableArrayEvents, ObservableArrayEventConstants} from "../observable/ObservableArray";
import {HistoricalModel} from "./HistoricalModel";
import {Path, PathElement} from "../Path";

/**
 * @category Real Time Data Subsystem
 */
export interface HistoricalArrayEvents extends ObservableArrayEvents {
}

/**
 * A read-only history-aware version of a [[RealTimeArray]].  See [[HistoricalElement]]
 * and [[HistoricalModel]] for some common usages.
 *
 * @category Real Time Data Subsystem
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
