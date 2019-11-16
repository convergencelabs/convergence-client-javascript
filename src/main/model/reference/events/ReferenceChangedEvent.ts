/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {IConvergenceEvent} from "../../../util";
import {ModelReference} from "../ModelReference";

/**
 * Emitted when a [[ModelReference]]'s value is set.
 *
 * @module Collaboration Awareness
 */
export class ReferenceChangedEvent<T> implements IConvergenceEvent {
  public static readonly NAME = "set";

  /**
   * @inheritdoc
   */
  public readonly name: string = ReferenceChangedEvent.NAME;

  /**
   * The first (if there were multiple) previous value of the reference.
   */
  public readonly oldValue: T;

  constructor(
    /**
     * The underlying reference that changed.
     */
    public readonly src: ModelReference<any>,

    /**
     * The previous values of the reference.
     */
    public readonly oldValues: T[],

    /**
     * All newly-added values. That is, values that were not in the set of old values.
     */
    public readonly addedValues: T[],

    /**
     * All just-removed values.  That is, old values not in the set of new values.
     */
    public readonly removedValues: T[],

    /**
     * true if this event was emitted by the system, as opposed to an explicit e.g.
     * [[LocalModelReference.set]].
     */
    public readonly synthetic: boolean
  ) {
    if (oldValues.length > 0) {
      this.oldValue = oldValues[0];
    }

    Object.freeze(this);
  }
}
