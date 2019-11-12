/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {Immutable} from "./Immutable";

export const ConvergenceErrorCodes = {
  AUTHENTICATION_FAILED: "authentication_failed",

  OFFLINE: "offline",

  CHAT_NOT_JOINED: "chat_not_joined"
};

Immutable.make(ConvergenceErrorCodes);
