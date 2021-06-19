/**
 * The possible permissions a chat can have.
 *
 * @module Chat
 */
export type ChatPermission =
  "create_chat"
  | "remove_chat"
  | "join_chat"
  | "leave_chat"
  | "add_chat_user"
  | "remove_chat_user"
  | "set_chat_name"
  | "set_topic"
  | "manage_chat_permissions";