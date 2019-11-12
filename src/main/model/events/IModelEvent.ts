/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IConvergenceEvent} from "../../util";
import {ObservableModel} from "../observable/ObservableModel";

/**
 * A parent interface indicating an event that occurred on a [[RealTimeModel]].
 *
 * @module Real Time Data
 */
export interface IModelEvent extends IConvergenceEvent {

  /**
   * The [[RealTimeModel]] or [[HistoricalModel]] on which this event occurred.
   */
  readonly src: ObservableModel;
}
