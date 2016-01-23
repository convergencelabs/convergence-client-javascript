module convergence.message {

  export class ErrorMessage implements ProtocolMessage, OutgoingProtocolMessage, IncomingProtocolMessage {
    constructor(public code: string, public details: string) {
    }

    type(): string {
      return MessageType.ERROR;
    }
  }

  export class ErrorMessageDeserializer {
    static deserialize(json: any): ErrorMessage {
      return new ErrorMessage(json.code, json.details);
    }
  }

  export class ErrorMessageSerializer {
    static serialize(message: ErrorMessage): any {
      return {
        code: message.code,
        details: message.details
      };
    }
  }
}
