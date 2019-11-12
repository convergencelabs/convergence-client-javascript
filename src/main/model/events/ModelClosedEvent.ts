/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IModelEvent} from "./IModelEvent";
import {ObservableModel} from "../observable/ObservableModel";

/**
 * The [[ModelClosedEvent]] is fired when a Model is closed either by the
 * client or the server.
 *
 * @category Real Time Data Subsystem
 */
export class ModelClosedEvent implements IModelEvent {
  public static readonly NAME = "closed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelClosedEvent.NAME;

  /**
   * @param src
   * @param local
   * @param reason
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] or [[HistoricalModel]] that was closed.
     */
    public readonly src: ObservableModel,

    /**
     * True if this change occurred locally (in the current session)
     */
    public readonly local: boolean,

    /**
     * In the event that the model was closed by the server, a reason may be provided.
     */
    public readonly reason?: string
  ) {
    Object.freeze(this);
  }
}
