/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {RealTimeElement} from "./RealTimeElement";
import {ObservableContainerElement} from "../observable/ObservableContainerElement";
import {Path, PathElement} from "../Path";

/**
 * An abstraction for `RealTimeElement`s with child elements.
 *
 * @category Real Time Data Subsystem
 */
export interface RealTimeContainerElement<T> extends ObservableContainerElement<T> {
  elementAt(path: Path): RealTimeElement<any>;
  elementAt(...elements: PathElement[]): RealTimeElement<any>;

  /**
   * @param relPath
   * @private
   * @internal
   * @hidden
   */
  _removeChild(relPath: PathElement): void;
}
