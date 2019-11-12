/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {StringMapLike} from "../util";

/**
 * Represents the options that can be set when Joining an activity.
 *
 * @category Collaboration Awareness
 */
export interface IActivityJoinOptions {
  /**
   * Initial state to set when joining an activity.
   */
  state?: StringMapLike;
}
