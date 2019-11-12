/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when the availability of a particular [[DomainUser]] changed.
 *
 * @module Presence
 */
export class PresenceAvailabilityChangedEvent implements IPresenceEvent {
  public static readonly NAME = "availability_changed";

  /**
   * @inheritdoc
   */
  public readonly name: string = PresenceAvailabilityChangedEvent.NAME;

  constructor(
    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * The new availability of the [[user]].
     */
    public readonly available: boolean
  ) {
    Object.freeze(this);
  }
}
