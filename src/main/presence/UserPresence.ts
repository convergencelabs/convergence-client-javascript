/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {deepClone} from "../util/ObjectUtils";
import {DomainUser} from "../identity";

/**
 * The [[UserPresence]] class represents the Presence state of a single domain
 * user within Convergence. An instance of [[UserPresence]] can be obtained
 * from the [[PresenceService]].
 *
 * @module Presence
 */
export class UserPresence {

  /**
   * @internal
   */
  private readonly _state: Map<string, any>;

  /**
   * @param user
   * @param available
   * @param state
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The domain user that this instance represents the presence of.
     */
    public readonly user: DomainUser,

    /**
     * True if the user is online in at least one session, false otherwise.
     */
    public readonly available: boolean, state: Map<string, any>
  ) {
    this._state = deepClone(state);
    Object.freeze(this);
  }

  /**
   * Returns the current state associated with this user's online presence.
   */
  public get state(): Map<string, any> {
    return deepClone(this._state);
  }
}
