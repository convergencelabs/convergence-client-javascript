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

/**
 * The Presence subsytem provides the ability to tell who is available
 * for collaboration and what their current status is.
 *
 * The entrance point is the [[PresenceService]].
 * User Presence tracks the availability and state of
 * Domain Users within the System.  Users are generally available or not
 * if they have at least one session that is connected. Each user in the
 * system can set presence state. Presence state is global for each user
 * in that the state is shared across all sessions.
 *
 * See the [developer guide](https://docs.convergence.io/guide/presence/overview.html) for additional background.
 *
 * @moduledefinition Presence
 */

export * from "./PresenceService";
export * from "./UserPresence";
export * from "./UserPresenceSubscription";
export * from "./events";
