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
 * The Chat API allows users to communicate via text embedded directly within
 * the application.
 *
 * See the [developer guide](https://guide.convergence.io/chat/overview.html)
 * for a few chat examples.
 *
 * @moduledefinition Chat
 */

export * from "./ChatService";
export * from "./Chat";
export * from "./ChatChannel";
export {IChatInfo, ChatType, ChatTypes } from "./IChatInfo";
export * from "./ChatPermission";
export * from "./ChatPermissionManager";
export * from "./ChatRoom";
export * from "./DirectChat";
export * from "./MembershipChat";

export * from "./ICreateChatChannelOptions";
export * from "./IChatMessageResponse";
export * from "./IChatMember";
export * from "./IChatHistorySearchOptions";

export * from "./history/";
export * from "./events/";

