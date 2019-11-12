/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

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

/**
 * @module Real Time Data
 */
export interface HistoricalObjectEvents extends ObservableObjectEvents {
}

/**
 * A read-only history-aware version of a [[RealTimeObject]].  See [[HistoricalElement]]
 * and [[HistoricalModel]] for some common usages.
 *
 * @module Real Time Data
 */
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

  /**
   * Returns the [[HistoricalElement]] at the given key at the current version.
   *
   * Also see [[RealTimeObject.get]].
   *
   * @param key the key whose value is desired
   */
  public get(key: string): HistoricalElement<any> {
    return this._wrapperFactory.wrap((this._delegate as ObjectNode).get(key));
  }

  /**
   * Returns an array of all the current version's keys
   *
   * @returns an array with all the current version's keys
   */
  public keys(): string[] {
    return (this._delegate as ObjectNode).keys();
  }

  /**
   * Returns true if the provided key existed on this object at the current version.
   */
  public hasKey(key: string): boolean {
    return (this._delegate as ObjectNode).hasKey(key);
  }

  /**
   * Synchronously calls the provided callback function for each key-value pair in this
   * object at the current version.
   *
   * @param callback a function to be called for each key-value pair
   */
  public forEach(callback: (model: HistoricalElement<any>, key?: string) => void): void {
    (this._delegate as ObjectNode).forEach((modelNode, key) => {
      callback(this._wrapperFactory.wrap(modelNode), key);
    });
  }

  /**
   * Given a search path, returns the [[HistoricalElement]] at that path, or null if
   * no such element exists. Scoped to this object, so the first element in the given
   * path should be a string (representing an existing key)
   *
   * @param path the search path for accessing a node within this object
   *
   * @returns The [[HistoricalElement]] at the given path, or null if no such element exists
   */
  public elementAt(path: Path): HistoricalElement<any>;
  public elementAt(...elements: PathElement[]): HistoricalElement<any>;
  public elementAt(...path: any[]): HistoricalElement<any> {
    return this._wrapperFactory.wrap((this._delegate as ObjectNode).valueAt(...path));
  }
}
