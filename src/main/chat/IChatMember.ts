/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {DomainUser} from "../identity";

/**
 * A member, or participant, of a Chat.  Has slightly different semantics depending on the
 * type of [[Chat]].
 *
 * @module Chat
 */
export interface IChatMember {
  /**
   * The chat member's underlying user.
   */
  readonly user: DomainUser;

  /**
   * The number of the most recent event which this member has received.  This is useful
   * for e.g. querying ([[Chat.getHistory]]) for events that a member hasn't yet seen.
   */
  readonly maxSeenEventNumber: number;
}