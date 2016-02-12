import MessageType from "./MessageType";
import {IncomingProtocolResponseMessage} from "./protocol";
import {OutgoingProtocolRequestMessage} from "./protocol";
import {MessageSerializer} from "./MessageSerializer";

export interface HandshakeRequest extends OutgoingProtocolRequestMessage {
  reconnect: boolean;
  reconnectToken: string;
  options: any;
}

MessageSerializer.registerMessageBodySerializer(MessageType.HANDSHAKE_REQUEST, (request: HandshakeRequest) => {
  return {
    r: request.reconnect,
    k: request.reconnectToken
  };
});

export interface HandshakeResponse extends IncomingProtocolResponseMessage {
  success: boolean;
  sessionId: string;
  reconnectToken: string;
  protocolConfig: any; // todo make interface
  error?: any;
  retryOk?: boolean;
}

MessageSerializer.registerMessageBodyDeserializer(MessageType.HANDSHAKE_RESPONSE, (body: any) => {
  return {
    success: body.s,
    sessionId: body.i,
    reconnectToken: body.k,
    protocolConfig: body.c,
    error: body.e,
    retryOk: body.r
  };
});
