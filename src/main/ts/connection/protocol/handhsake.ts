import {IncomingProtocolResponseMessage} from "./protocol";
import {OutgoingProtocolRequestMessage} from "./protocol";
import {MessageBodySerializer} from "./MessageSerializer";
import {MessageBodyDeserializer} from "./MessageSerializer";

export interface HandshakeRequest extends OutgoingProtocolRequestMessage {
  reconnect: boolean;
  reconnectToken: string;
}

export const HandshakeRequestSerializer: MessageBodySerializer = (request: HandshakeRequest) => {
  return {
    r: request.reconnect,
    k: request.reconnectToken
  };
};

export interface HandshakeResponse extends IncomingProtocolResponseMessage {
  success: boolean;
  reconnectToken: string;
  protocolConfig: any; // todo make interface
  error?: any;
  retryOk?: boolean;
}

export const HandshakeResponseDeserializer: MessageBodyDeserializer<HandshakeResponse> = (body: any) => {
  return {
    success: body.s,
    reconnectToken: body.k,
    protocolConfig: body.c,
    error: body.e,
    retryOk: body.r
  };
};
