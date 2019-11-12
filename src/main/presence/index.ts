/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
