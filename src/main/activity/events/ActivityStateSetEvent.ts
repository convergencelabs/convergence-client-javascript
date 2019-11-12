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
 * The ActivityStateSetEvent is fired when a remote session sets one or
 * elements from its state within the [[Activity]].
 *
 * @module Collaboration Awareness
 */
export class ActivityStateSetEvent implements IActivityEvent {

  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "state_set";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivityStateSetEvent.EVENT_NAME;

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
    public readonly local: boolean,
    /**
     * The key of the state was set.
     */
    public readonly key: string,
    /**
     * The state that was modified.
     */
    public readonly value: any,
    /**
     * The state that was modified.
     */
    public readonly oldValue: any) {
    Object.freeze(this);
  }
}
