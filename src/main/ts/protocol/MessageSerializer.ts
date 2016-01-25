module convergence.message {
  export class MessageSerializer {

    static deserialize(body: any, type: string): IncomingProtocolMessage {
      switch (type) {
        case MessageType.ERROR:
          return ErrorMessageDeserializer.deserialize(body);
        case MessageType.HANDSHAKE:
          return HandshakeResponseDeserializer.deserialize(body);
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
        default:
          throw new Error("Unexpected protocol type: " + type);
      }
    }
  }
}
