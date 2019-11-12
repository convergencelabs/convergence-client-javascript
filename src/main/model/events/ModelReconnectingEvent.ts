/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] is attempting to reconnect to the server
 * after being offline.
 *
 * @module Real Time Data
 */
export class ModelReconnectingEvent implements IModelEvent {
  public static readonly NAME = "reconnecting";

  /**
   * The name of this event type.  This can be used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ModelReconnectingEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] that is reconnecting
     */
    public readonly src: RealTimeModel
  ) {
    Object.freeze(this);
  }
}
