import {MessageBodySerializer} from "../MessageSerializer";
import {OutgoingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {IncomingProtocolNormalMessage} from "../protocol";

export interface LeaveRoomMessage extends OutgoingProtocolNormalMessage {
  roomId: string;
}

export var LeaveRoomMessageSerializer: MessageBodySerializer = (request: LeaveRoomMessage) => {
  return {
    r: request.roomId
  };
};

export interface UserLeftRoomMessage extends IncomingProtocolNormalMessage {
  roomId: string;
  username: string;
  sessionId: string;
  timestamp: number;
}

export var UserLeftRoomMessageDeserializer: MessageBodyDeserializer<UserLeftRoomMessage> = (body: any) => {
  const result: UserLeftRoomMessage = {
    roomId: body.r,
    username: body.u,
    sessionId: body.s,
    timestamp: body.p
  };
  return result;
};
