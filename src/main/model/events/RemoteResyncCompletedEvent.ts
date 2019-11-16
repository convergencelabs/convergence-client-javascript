/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IConvergenceEvent} from "../../util";
import {RealTimeModel} from "../rt";
import {DomainUser} from "../../identity";

/**
 * The [[RemoteResyncCompletedEvent]] is fired when a remote client has
 * completed a resynchronization process after being offline.
 *
 * @module Real Time Data
 */
export class RemoteResyncCompletedEvent implements IConvergenceEvent {
  public static readonly NAME = "remote_resync_completd";

  /**
   * @inheritdoc
   */
  public readonly name: string = RemoteResyncCompletedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The model for which the remote client has completed a resync.
     */
    public readonly model: RealTimeModel,

    /**
     * The session id of the remote client.
     */
    public readonly sessionId?: string,

    /**
     * The user of the remote client.
     */
    public readonly user?: DomainUser
  ) {
    Object.freeze(this);
  }
}
