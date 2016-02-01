module convergence.message {
  export class MessageSerializer {

    static deserialize(body: any, type: string): IncomingProtocolMessage {
      switch (type) {
        case MessageType.ERROR:
          return ErrorMessageDeserializer.deserialize(body);
        case MessageType.HANDSHAKE:
          return HandshakeResponseDeserializer.deserialize(body);
        case MessageType.AUTH_PASSWORD:
        case MessageType.AUTH_TOKEN:
          return AuthenticationResponseDeserializer.deserialize(body);
        default:
          throw new Error("Unexpected protocol type: " + type);
      }
    }

    static serialize(body: OutgoingProtocolMessage): any {
      var type: string = body.type;
      switch (type) {
        case MessageType.ERROR:
          return ErrorMessageSerializer.serialize(<ErrorMessage>body);
        case MessageType.HANDSHAKE:
          return HandshakeRequestSerializer.serialize(<HandshakeRequest>body);
        case MessageType.AUTH_PASSWORD:
          return PasswordAuthRequestSerializer.serialize(<PasswordAuthRequest>body);
        case MessageType.AUTH_TOKEN:
          return TokenAuthRequestSerializer.serialize(<TokenAuthRequest>body);
        default:
          throw new Error("Unexpected protocol type: " + type);
      }
    }
  }
}
