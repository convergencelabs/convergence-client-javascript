import {MessageBodySerializer} from "../MessageSerializer";
import {OutgoingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {IncomingProtocolNormalMessage} from "../protocol";

export interface JoinRoomMessage extends OutgoingProtocolNormalMessage {
  roomId: string;
}

export var JoinRoomMessageSerializer: MessageBodySerializer = (request: JoinRoomMessage) => {
  return {
    i: request.roomId
  };
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
    timestamp: body.t
  };
  return result;
};
