/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableObject} from "../observable/ObservableObject";
import {DomainUser} from "../../identity";

/**
 * Emitted when the entire [[RealTimeObject.value]] of a [[RealTimeObject]] is set,
 * meaning its entire contents were replaced, or set initially.
 *
 * @category Real Time Data Subsystem
 */
export class ObjectSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";

  /**
   * @inheritdoc
   */
  public readonly name: string = ObjectSetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * A read-only representation of the [[RealTimeObject]] which was modified
     */
    public readonly element: ObservableObject,

    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * @inheritdoc
     */
    public readonly sessionId: string,

    /**
     * True if the change occurred locally (within the current session)
     */
    public readonly local: boolean
  ) {
    Object.freeze(this);
  }
}
