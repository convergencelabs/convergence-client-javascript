/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IConvergenceEvent} from "../../util";
import {DomainUser} from "../../identity";

/**
 * The base interface for [[UserPresence]]-related events.
 *
 * @category Presence Subsystem
 */
export interface IPresenceEvent extends IConvergenceEvent {
  /**
   * The user associated with the [[UserPresence|presence]] event.
   */
  readonly user: DomainUser;
}
