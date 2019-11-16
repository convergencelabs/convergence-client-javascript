/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {Operation} from "./ops/Operation";
import {Immutable} from "../../util/Immutable";

/**
 * @hidden
 * @internal
 */
export class ClientOperationEvent {
  constructor(
    public sessionId: string,
    public seqNo: number,
    public contextVersion: number,
    public timestamp: Date,
    public operation: Operation) {
    Object.freeze(this);
  }

  public copy(mods?: {
    sessionId?: string,
    seqNo?: number,
    contextVersion?: number,
    timestamp?: Date,
    operation?: Operation
  }) {
    mods = Immutable.getOrDefault(mods, {});
    return new ClientOperationEvent(
      Immutable.getOrDefault(mods.sessionId, this.sessionId),
      Immutable.getOrDefault(mods.seqNo, this.seqNo),
      Immutable.getOrDefault(mods.contextVersion, this.contextVersion),
      Immutable.getOrDefault(mods.timestamp, this.timestamp),
      Immutable.getOrDefault(mods.operation, this.operation)
    );
  }
}
