/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] is subscribed to for offline availability
 * and becomes available for the first time.
 *
 * @module Real Time Data
 */
export class OfflineModelAvailableEvent implements IModelEvent {
  public static readonly NAME = "offline_model_available";

  /**
   * @inheritdoc
   */
  public readonly name: string = OfflineModelAvailableEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] that just went offline.
     */
    public readonly src: RealTimeModel
  ) {
    Object.freeze(this);
  }
}
