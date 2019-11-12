/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
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
