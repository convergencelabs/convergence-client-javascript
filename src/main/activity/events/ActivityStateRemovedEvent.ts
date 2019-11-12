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
 * The ActivityStateRemovedEvent is fired when a remote session removes one or
 * elements from its state within the [[Activity]].
 *
 * @module Collaboration Awareness
 */
export class ActivityStateRemovedEvent implements IActivityEvent {

  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "state_removed";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivityStateRemovedEvent.EVENT_NAME;

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
     * The key of the state that was removed.
     */
    public readonly key: string,
    /**
     * The state that was modified.
     */
    public readonly oldValue: any) {
    Object.freeze(this);
  }
}
