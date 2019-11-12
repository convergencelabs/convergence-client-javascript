/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ActivityParticipant} from "../ActivityParticipant";
import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";
import {DomainUser} from "../../identity";

/**
 * The ActivitySessionJoinedEvent is fired when a remote session joins an
 * [[Activity]].
 *
 * @category Collaboration Awareness
 */
export class ActivitySessionJoinedEvent implements IActivityEvent {
  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "session_joined";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivitySessionJoinedEvent.EVENT_NAME;

  /**
   * @hidden
   * @internal
   * @inheritDoc
   */
  constructor(
    /**
     * @inheritDoc
     */
    public readonly activity: Activity,
    /**
     * @inheritDoc
     */
    public readonly user: DomainUser,
    /**
     * @inheritDoc
     */
    public readonly sessionId: string,
    /**
     * @inheritDoc
     */
    public readonly local: boolean,
    /**
     * The participant that this event relates to.
     */
    public readonly participant: ActivityParticipant) {
    Object.freeze(this);
  }
}
