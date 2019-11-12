/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {HistoricalElement} from "./HistoricalElement";
import {ObservableContainerElement} from "../observable/ObservableContainerElement";
import {Path, PathElement} from "../Path";

/**
 * An abstraction representing a unified type for an [[HistoricalObject]] and [[HistoricalArray]].
 *
 * @category Real Time Data Subsystem
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
