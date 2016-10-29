import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {IncomingProtocolNormalMessage} from "../protocol";
import {OutgoingProtocolRequestMessage} from "../protocol";
import {IncomingProtocolResponseMessage} from "../protocol";

export interface JoinRoomRequestMessage extends OutgoingProtocolRequestMessage {
  roomId: string;
}

export var JoinRoomRequestMessageSerializer: MessageBodySerializer = (request: JoinRoomRequestMessage) => {
  return {
    r: request.roomId
  };
};

export interface JoinRoomResponseMessage extends IncomingProtocolResponseMessage {
  members: string[];
  messageCount: number;
  lastMessageTime: number;
}

export var JoinRoomResponseMessageDeserializer: MessageBodyDeserializer<JoinRoomResponseMessage> = (body: any) => {
  var result: JoinRoomResponseMessage = {
    members: body.m,
    messageCount: body.c,
    lastMessageTime: body.l
  };

  return result;
};


export interface UserJoinedRoomMessage extends IncomingProtocolNormalMessage {
  roomId: string;
  username: string;
  sessionId: string;
  timestamp: number;
}

export var UserJoinedRoomMessageDeserializer: MessageBodyDeserializer<UserJoinedRoomMessage> = (body: any) => {
  var result: UserJoinedRoomMessage = {
    roomId: body.r,
    username: body.u,
    sessionId: body.s,
    timestamp: body.p
  };
  return result;
};
