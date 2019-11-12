/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
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
