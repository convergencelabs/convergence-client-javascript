/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] goes online after being offline. Subscribe
 * to this directly on a [[RealTimeModel]] rather than a [[RealTimeElement]]
 * within.
 *
 * @module Real Time Data
 */
export class ModelOnlineEvent implements IModelEvent {
  public static readonly NAME = "online";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelOnlineEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] that came online.
     */
    public readonly src: RealTimeModel
  ) {
    Object.freeze(this);
  }
}
