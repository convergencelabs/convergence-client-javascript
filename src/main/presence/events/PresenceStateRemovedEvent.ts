/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when one or more key-value pairs of a particular [[DomainUser]]'s
 * presence [[UserPresence.state|state]] were [[PresenceService.removeState|removed]].
 *
 * @category Presence Subsystem
 */
export class PresenceStateRemovedEvent implements IPresenceEvent {
  public static readonly NAME = "state_removed";

  /**
   * @inheritdoc
   */
  public readonly name: string = PresenceStateRemovedEvent.NAME;

  constructor(
    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * The keys of the state items that were just removed.
     */
    public readonly keys: string[]
  ) {
    Object.freeze(this);
  }
}
