/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IConvergenceEvent} from "../../util";
import {ObservableElement} from "../observable/ObservableElement";

/**
 * The [[IConvergenceModelValueEvent]] is the parent interface of all events
 * representing changes to model values.
 *
 * @module Real Time Data
 */
export interface IConvergenceModelValueEvent extends IConvergenceEvent {

  /**
   * The [[RealTimeElement]] or [[HistoricalElement]] whose contents changed.
   */
  readonly element: ObservableElement<any>;

  /**
   * True if the change occurred locally (within the current session)
   */
  readonly local: boolean;
}
