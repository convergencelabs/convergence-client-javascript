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

import {RealTimeElement} from "../rt/RealTimeElement";
import {ModelReference} from "./ModelReference";
import {RangeTransformer} from "../ot/xform/reference/RangeTransformer";
import {ReferenceManager} from "./ReferenceManager";
import {DomainUser} from "../../identity";
import {IndexTransformer} from "../ot/xform/reference/IndexTransformer";

/**
 * A single range to be used with a [[RangeReference]].
 *
 * For example, in
 * ```
 *  The quick brown fox jumped over the lazy dog
 * ```
 *
 * a selection of "fox jumped" would be represented with the range `{start: 16, end: 26}`
 *
 * @module Real Time Data
 */
export interface IndexRange {
  start: number;
  end: number;
}

/**
 * Represents a range of text in a [[RealTimeString]] that must be adjusted while
 * the data is changing.  See the
 * [developer guide](https://guide.convergence.io/models/references/realtimestring.html)
 * for some examples.
 *
 * @module Real Time Data
 */
export class RangeReference extends ModelReference<IndexRange> {

  /**
   * @param referenceManager
   * @param key
   * @param source
   * @param user
   * @param sessionId
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeElement<any>,
              user: DomainUser,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ModelReference.Types.RANGE, key, source, user, sessionId, local);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleInsert(index: number, length: number): void {
    this._setIfChanged(RangeTransformer.handleInsert(this._values, index, length), true);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleRemove(index: number, length: number): void {
    this._setIfChanged(RangeTransformer.handleRemove(this._values, index, length), true);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleSplice(index: number, deleteCount: number, insertCount: number): void {
    this._setIfChanged(RangeTransformer.handleSplice(this._values, index, deleteCount, insertCount), true);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleReorder(fromIndex: number, toIndex: number): void {
    this._setIfChanged(RangeTransformer.handleReorder(this._values, fromIndex, toIndex), true);
  }
}
