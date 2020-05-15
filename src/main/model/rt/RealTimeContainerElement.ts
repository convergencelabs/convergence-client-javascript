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

import {RealTimeElement} from "./RealTimeElement";
import {ObservableContainerElement} from "../observable/ObservableContainerElement";
import {Path, PathElement} from "../Path";

/**
 * An abstraction for `RealTimeElement`s with child elements.
 *
 * @module Real Time Data
 */
export interface RealTimeContainerElement<T = any> extends ObservableContainerElement<T> {
  elementAt(path: Path): RealTimeElement;
  elementAt(...elements: PathElement[]): RealTimeElement;

  /**
   * @param relPath
   * @private
   * @internal
   * @hidden
   */
  _removeChild(relPath: PathElement): void;
}
