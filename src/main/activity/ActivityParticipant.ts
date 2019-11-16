/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {deepClone} from "../util/ObjectUtils";
import {Activity} from "./Activity";
import {DomainUser} from "../identity";

/**
 * The ActivityParticipant represents an individual user session that has
 * joined a particular [[Activity]].
 *
 * @module Collaboration Awareness
 */
export class ActivityParticipant {

  /**
   * @internal
   */
  private readonly _state: Map<string, any>;

  /**
   * @param activity
   *   The [[Activity]] this participant belongs too.
   * @param sessionId
   *   The session id of the participant.
   * @param user
   *   The username of the participant.
   * @param local
   *   A flag indicating if the participant represents the local user /
   *   session.
   * @param state
   *   The state of this participant within the activity.
   *
   * @hidden
   * @internal
   */
  constructor(public readonly activity: Activity,
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly local: boolean,
              state: Map<string, any>) {
    this._state = deepClone(state);
    Object.freeze(this);
  }

  /**
   * @returns
   *   The current state of this participant within this activity.
   */
  public get state(): Map<string, any> {
    return deepClone(this._state);
  }

  /**
   * Clones this ActivityParticipant, optionally making changes while cloning.
   *
   * @param modifications
   *   Optional overrides to the properties of the ActivityParticipant.
   */
  public clone(modifications: {
    activity?: Activity,
    user?: DomainUser,
    sessionId?: string,
    local?: boolean,
    state?: Map<string, any>
  } = {}): ActivityParticipant {
    return new ActivityParticipant(
      modifications.activity !== undefined ? modifications.activity : this.activity,
      modifications.user !== undefined ? modifications.user : this.user,
      modifications.sessionId !== undefined ? modifications.sessionId : this.sessionId,
      modifications.local !== undefined ? modifications.local : this.local,
      modifications.state !== undefined ? modifications.state : this.state
    );
  }
}
