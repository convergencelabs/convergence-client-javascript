/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IModelEvent} from "./IModelEvent";
import {ObservableModel} from "../observable/ObservableModel";

/**
 * Emitted when a [[RealTimeModel]]'s version changes.  Subscribe to this directly
 * on a [[RealTimeModel]] rather than a [[RealTimeElement]] within.
 *
 * Note that on a local change, this won't be fired until the version is updated on the
 * server and a response message sent back to the client.
 *
 * @category Real Time Data Subsystem
 */
export class VersionChangedEvent implements IModelEvent {
  public static readonly NAME = "version_changed";

  /**
   * @inheritdoc
   */
  public readonly name: string = VersionChangedEvent.NAME;

  /**
   * @param src
   * @param version
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] or [[HistoricalModel]] whose version just changed
     */
    public readonly src: ObservableModel,

    /**
     * The new version of the model
     */
    public readonly version: number
  ) {
    Object.freeze(this);
  }
}
