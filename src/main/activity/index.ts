/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * For any real-time collaboration application, connected users must have some
 * context about their current collaboration state.  This goes beyond just
 * data synchronization, typically involving communicating user intentions
 * (such as highlighting a sentence before deleting it) and availability
 * (who can I collaborate with?).
 *
 * Great real-time apps go the extra mile to prevent conflicts. That's what
 * this API is all about.
 *
 * @moduledefinition Collaboration Awareness
 */
export * from "./ActivityParticipant";
export * from "./Activity";
export * from "./IActivityJoinOptions";
export * from "./ActivityService";
export * from "./events";
