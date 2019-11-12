/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {RealTimeModel} from "../rt";
import {IModelEvent} from "./IModelEvent";

/**
 * The [[ModelModifiedEvent]] is when a model has its first non-acknowledged
 * mutation. It is fired when the model currently has not outstanding changes
 * and a change is made. It will not be fired on subsequent consecutive
 * changes unless all changes are first acknowledged.
 *
 * @category Real Time Data Subsystem
 */
export class ModelModifiedEvent implements IModelEvent {
  public static readonly NAME = "modified";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelModifiedEvent.NAME;

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
