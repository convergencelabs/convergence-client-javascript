/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";
import {DomainUser} from "../../identity";

/**
 * The ActivitySessionLeftEvent is fired when a remote session leaves an
 * [[Activity]].
 *
 * @category Collaboration Awareness
 */
export class ActivitySessionLeftEvent implements IActivityEvent {

  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "session_left";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivitySessionLeftEvent.EVENT_NAME;

  /**
   * @hidden
   * @internal
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
    public readonly local: boolean) {
    Object.freeze(this);
  }
}
