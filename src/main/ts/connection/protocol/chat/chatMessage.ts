import {IncomingProtocolNormalMessage} from "../protocol";
import {OutgoingProtocolNormalMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface PublishChatMessage extends OutgoingProtocolNormalMessage {
  roomId: string;
  message: string;
}

export const PublishChatMessageSerializer: MessageBodySerializer = (request: PublishChatMessage) => {
  return {
    r: request.roomId,
    m: request.message
  };
};

export interface UserChatMessage extends IncomingProtocolNormalMessage {
  roomId: string;
  message: string;
  username: string;
  sessionId: string;
  timestamp: number;
}

export const UserChatMessageDeserializer: MessageBodyDeserializer<UserChatMessage> = (body: any) => {
  const result: UserChatMessage = {
    roomId: body.r,
    message: body.m,
    username: body.u,
    sessionId: body.s,
    timestamp: body.p
  };
  return result;
};
