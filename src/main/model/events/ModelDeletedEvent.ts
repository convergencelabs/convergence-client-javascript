/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] has been deleted.
 *
 * @category Real Time Data Subsystem
 */
export class ModelDeletedEvent implements IModelEvent {
  public static readonly NAME = "deleted";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelDeletedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] that was deleted.
     */
    public readonly src: RealTimeModel,

    /**
     * True if this change occurred locally (in the current session)
     */
    public readonly local: boolean,

    /**
     * In the event that the model was deleted remotely, a reason may be provided.
     */
    public readonly reason?: string
  ) {
    Object.freeze(this);
  }
}
