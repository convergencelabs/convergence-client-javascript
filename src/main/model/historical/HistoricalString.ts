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
import {StringNode} from "../internal/StringNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableString,
  ObservableStringEvents,
  ObservableStringEventConstants
} from "../observable/ObservableString";
import {HistoricalModel} from "./HistoricalModel";

/**
 * @module Real Time Data
 */
export interface HistoricalStringEvents extends ObservableStringEvents {
}

/**
 * A read-only history-aware version of a [[RealTimeString]].  See [[HistoricalElement]]
 * and [[HistoricalModel]] for some common usages.
 *
 * @module Real Time Data
 */
export class HistoricalString extends HistoricalElement<string> implements ObservableString {

  public static readonly Events: HistoricalStringEvents = ObservableStringEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: StringNode, wrapperFactory: HistoricalWrapperFactory, model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }

  /**
   * The length of this string at the current version.
   *
   * @returns the length of this string
   */
  public length(): number {
    return (this._delegate as StringNode).length();
  }
}
