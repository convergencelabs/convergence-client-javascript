import {IncomingProtocolResponseMessage, OutgoingProtocolRequestMessage} from "./protocol";
import {MessageBodySerializer, MessageBodyDeserializer} from "./MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface HandshakeRequest extends OutgoingProtocolRequestMessage {
  reconnect: boolean;
  reconnectToken: string;
}

/**
 * @hidden
 * @internal
 */
export const HandshakeRequestSerializer: MessageBodySerializer = (request: HandshakeRequest) => {
  return {
    r: request.reconnect,
    k: request.reconnectToken
  };
};

/**
 * @hidden
 * @internal
 */
export interface HandshakeResponse extends IncomingProtocolResponseMessage {
  success: boolean;
  reconnectToken: string;
  protocolConfig: any; // todo make interface
  error?: any;
  retryOk?: boolean;
}

/**
 * @hidden
 * @internal
 */
export const HandshakeResponseDeserializer: MessageBodyDeserializer<HandshakeResponse> = (body: any) => {
  return {
    success: body.s,
    reconnectToken: body.k,
    protocolConfig: body.c,
    error: body.e,
    retryOk: body.r
  };
};
