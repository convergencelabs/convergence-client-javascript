/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {RealTimeModel} from "../rt";
import {IModelEvent} from "./IModelEvent";

/**
 * The [[ModelCommittedEvent]] is fired when a model has unacknowledged local
 * modifications to the model, and then all modifications are acknowledged by
 * the server.
 *
 * @module Real Time Data
 */
export class ModelCommittedEvent implements IModelEvent {
  public static readonly NAME = "committed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelCommittedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The model model that emitted the event.
     */
    public readonly src: RealTimeModel
  ) {
    Object.freeze(this);
  }
}
