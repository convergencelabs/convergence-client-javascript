/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IConvergenceEvent} from "../../util";

/**
 * The superclass for all chat-related events.
 *
 * @category Chat Subsytem
 */
export interface IChatEvent extends IConvergenceEvent {
  readonly chatId: string;
}
