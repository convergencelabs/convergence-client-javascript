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
 * The [[RemoteResyncStartedEvent]] is fired when a remote client has
 * started a resynchronization process after being offline.
 *
 * @module Real Time Data
 */
export class RemoteResyncStartedEvent implements IConvergenceEvent {
  public static readonly NAME = "remote_resync_started";

  /**
   * @inheritdoc
   */
  public readonly name: string = RemoteResyncStartedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The model for which the remote client has started a resync.
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
