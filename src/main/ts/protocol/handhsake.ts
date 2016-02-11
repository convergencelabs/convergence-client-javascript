import MessageType from "./MessageType";
import {IncomingProtocolResponseMessage} from "./protocol";
import {OutgoingProtocolRequestMessage} from "./protocol";


export interface HandshakeRequest extends OutgoingProtocolRequestMessage {
  reconnect: boolean;
  reconnectToken: string;
  options: any;
}

export class HandshakeRequestSerializer {
  static serialize(request: HandshakeRequest): any {
    return {
      t: MessageType.HANDSHAKE_REQUEST,
      r: request.reconnect,
      k: request.reconnectToken
    };
  }
}

export interface HandshakeResponse extends IncomingProtocolResponseMessage {
  success: boolean;
  sessionId: string;
  reconnectToken: string;
  protocolConfig: any; // todo make interface
  error?: any;
  retryOk?: boolean;
}

export class HandshakeResponseDeserializer {
  static deserialize(body: any): HandshakeResponse {
    return {
      type: MessageType.HANDSHAKE_RESPONSE,
      success: body.s,
      sessionId: body.i,
      reconnectToken: body.k,
      protocolConfig: body.c,
      error: body.e,
      retryOk: body.r
    };
  }
}
