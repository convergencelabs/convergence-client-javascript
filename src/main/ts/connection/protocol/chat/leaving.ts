import {OutgoingProtocolRequestMessage} from "../protocol";
import {IncomingProtocolNormalMessage} from "../protocol";

/**
 * @hidden
 * @internal
 */
export interface LeaveChatChannelRequestMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
}

/**
 * @hidden
 * @internal
 */
export function LeaveChatChannelRequestMessageSerializer(request: LeaveChatChannelRequestMessage): any {
  return {
    i: request.channelId
  };
}

/**
 * @hidden
 * @internal
 */
export interface UserLeftChatChannelMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  username: string;
  timestamp: Date;
}

/**
 * @hidden
 * @internal
 */
export function UserLeftChatChannelMessageDeserializer(body: any): UserLeftChatChannelMessage {
  const result: UserLeftChatChannelMessage = {
    channelId: body.i,
    eventNumber: body.n,
    username: body.u,
    timestamp: new Date(body.p)
  };
  return result;
}

/**
 * @hidden
 * @internal
 */
export interface RemoveUserFromChatChannelMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  username: string;
}

/**
 * @hidden
 * @internal
 */
export function RemoveUserFromChatChannelMessageSerializer(request: RemoveUserFromChatChannelMessage): any {
  return {
    i: request.channelId,
    u: request.username
  };
}

/**
 * @hidden
 * @internal
 */
export interface UserRemovedFromChatChannelMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  username: string;
  removedBy: string;
  timestamp: Date;
}

/**
 * @hidden
 * @internal
 */
export function UserRemovedFromChatChannelMessageDeserializer(body: any): UserRemovedFromChatChannelMessage {
  const result: UserRemovedFromChatChannelMessage = {
    channelId: body.i,
    eventNumber: body.n,
    removedBy: body.b,
    username: body.u,
    timestamp: new Date(body.p)
  };
  return result;
}
