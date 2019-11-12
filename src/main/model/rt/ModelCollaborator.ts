/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {DomainUser} from "../../identity";

/**
 * The [[ModelCollaborator]] represents a user / session that has opened
 * a given model for shared editing.
 *
 * @module Real Time Data
 */
export class ModelCollaborator {
  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The user of the [[ModelCollaborator]].
     */
    public readonly user: DomainUser,

    /**
     * The sessionId of the [[ModelCollaborator]].
     */
    public readonly sessionId: string
  ) {
    Object.freeze(this);
  }
}
