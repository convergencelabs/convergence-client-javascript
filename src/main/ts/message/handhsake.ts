
module convergence.message {

  export class HandshakeRequest implements OutgoingProtocolRequestMessage {
    constructor(public reconnect: boolean, public reconnectToken: string, public options: any) {
    }

    type(): string {
      return MessageType.HANDSHAKE;
    }
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

  export class HandshakeResponse implements IncomingProtocolResponseMessage {
    constructor(public success: boolean,
                public clientId: string,
                public reconnectToken: string,
                public protocolConfig: any, // todo make interface
                public error: any,
                public retryOk: boolean) {
    }
  }

  export class HandshakeResponseDeserializer {
    static deserialize(body: any): HandshakeResponse {
      return new HandshakeResponse(
        body.success,
        body.sessionId,
        body.reconnectToken,
        {},
        body.error,
        false
      );
    }
  }
}
