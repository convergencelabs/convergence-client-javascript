/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a particular [[DomainUser]]'s [[UserPresence.state|state]] was cleared.
 *
 * @module Presence
 */
export class PresenceStateClearedEvent implements IPresenceEvent {
  public static readonly NAME = "state_cleared";

  /**
   * @inheritdoc
   */
  public readonly name: string = PresenceStateClearedEvent.NAME;

  constructor(
    /**
     * @inheritdoc
     */
    public readonly user: DomainUser
  ) {
    Object.freeze(this);
  }
}
