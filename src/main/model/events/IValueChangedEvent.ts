/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IConvergenceModelValueEvent} from "./IConvergenceModelValueEvent";
import {DomainUser} from "../../identity";

/**
 * The [[IValueChangedEvent]] is the parent interface to all events fired by
 * individual model elements when their data changes.
 *
 * @category Real Time Data Subsystem
 */
export interface IValueChangedEvent extends IConvergenceModelValueEvent {
  /**
   * The user which performed the modification
   */
  readonly user: DomainUser;

  /**
   * The sessionId corresponding to the session that performed the modification
   */
  readonly sessionId: string;
}
