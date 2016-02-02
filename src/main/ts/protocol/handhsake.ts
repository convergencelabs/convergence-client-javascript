module convergence.protocol {

  export interface HandshakeRequest extends OutgoingProtocolRequestMessage {
    reconnect: boolean;
    reconnectToken: string;
    options: any;
  }

  export class HandshakeRequestSerializer {
    static serialize(request: HandshakeRequest): any {
      return {
        reconnect: request.reconnect,
        reconnectToken: request.reconnectToken,
        options: request.options
      };
    }
  }

  export interface HandshakeResponse extends IncomingProtocolResponseMessage {
    success: boolean;
    clientId: string;
    reconnectToken: string;
    protocolConfig: any; // todo make interface
    error: any;
    retryOk: boolean;
  }

  export class HandshakeResponseDeserializer {
    static deserialize(body: any): HandshakeResponse {
      return {
        success: body.success,
        clientId: body.sessionId,
        reconnectToken: body.reconnectToken,
        protocolConfig: {},
        error: body.error,
        retryOk: false,
        type: MessageType.HANDSHAKE
      };
    }
  }
}
