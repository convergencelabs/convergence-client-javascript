/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {DomainUser} from "../../identity";

/**
 * The [[ModelCollaborator]] represents a user / session that has opened
 * a given model for shared editing.
 *
 * @category Real Time Data Subsystem
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
