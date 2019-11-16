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
 * and a new version has been downloaded.
 *
 * @module Real Time Data
 */
export class OfflineModelUpdatedEvent implements IModelEvent {
  public static readonly NAME = "offline_model_updated";

  /**
   * @inheritdoc
   */
  public readonly name: string = OfflineModelUpdatedEvent.NAME;

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
