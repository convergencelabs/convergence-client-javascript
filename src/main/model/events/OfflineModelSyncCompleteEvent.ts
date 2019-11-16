/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IConvergenceEvent} from "../../util";

/**
 * Emitted when a change to the subscription for offline models changes and
 * the change results in new models needing to be downloaded.
 *
 * @module Real Time Data
 */
export class OfflineModelSyncPendingEvent implements IConvergenceEvent {
  public static readonly NAME = "offline_model_sync_pending";

  /**
   * @inheritdoc
   */
  public readonly name: string = OfflineModelSyncPendingEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor() {
    Object.freeze(this);
  }
}
