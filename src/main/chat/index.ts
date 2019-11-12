/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * The Chat API allows users to communicate via text embedded directly within
 * the application.
 *
 * See the [developer guide](https://docs.convergence.io/guide/chat/overview.html)
 * for a few chat examples.
 *
 * @moduledefinition Chat
 */

export * from "./ChatService";
export * from "./Chat";
export * from "./ChatChannel";
export * from "./ChatInfo";
export * from "./ChatPermissionManager";
export * from "./ChatRoom";
export * from "./DirectChat";
export * from "./MembershipChat";

export * from "./history/";
export * from "./events/";
