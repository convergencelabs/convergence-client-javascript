module convergence.protocol {
  export class MessageSerializer {

    static deserialize(body: any, type: string): IncomingProtocolMessage {
      switch (type) {
        case MessageType.ERROR:
          return ErrorMessageDeserializer.deserialize(body);
        case MessageType.HANDSHAKE:
          return HandshakeResponseDeserializer.deserialize(body);
        case MessageType.AUTHENTICATE:
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
        case MessageType.AUTHENTICATE:
          return AuthRequestSerializer.serialize(<AuthRequest>body);
        default:
          throw new Error("Unexpected protocol type: " + type);
      }
    }
  }
}
