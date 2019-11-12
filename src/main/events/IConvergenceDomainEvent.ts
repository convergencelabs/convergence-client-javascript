/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IConvergenceEvent} from "../util";
import {ConvergenceDomain} from "../ConvergenceDomain";

/**
 * The base interface for any [[ConvergenceDomain]]-related events.
 *
 * @category Connection and Authentication
 */
export interface IConvergenceDomainEvent extends IConvergenceEvent {
  /**
   * The domain on which this event occurred.
   */
  domain: ConvergenceDomain;
}
