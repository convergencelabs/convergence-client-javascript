/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
