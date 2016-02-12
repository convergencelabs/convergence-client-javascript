import MessageType from "./MessageType";
import {MessageEnvelope} from "./protocol";
import {IncomingProtocolMessage} from "./protocol";
import {OutgoingProtocolMessage} from "./protocol";

export type MessageBodySerializer = (message: OutgoingProtocolMessage) => any;
export type MessageBodyDeserializer = (message: any) => IncomingProtocolMessage;

export class MessageSerializer {

  private static _serializers: {[key: number]: MessageBodySerializer};
  private static _deserializers: {[key: number]: MessageBodyDeserializer};

  private static _defaultBodyDeserializer: MessageBodyDeserializer = (message: any) => {
    return {};
  };

  static registerMessageBodySerializer(type: MessageType, serializer: MessageBodySerializer): void {
    if (this._serializers[type] === undefined) {
      throw new Error(`Serializer for type ${MessageType[type]}`);
    }
    this._serializers[type] = serializer;
  }

  static registerMessageBodyDeserializer(type: MessageType, deserializer: MessageBodyDeserializer): void {
    if (this._deserializers[type] === undefined) {
      throw new Error(`Deserializer for type ${MessageType[type]}`);
    }
    this._deserializers[type] = deserializer;
  }

  static registerDefaultMessageBodyDeserializer(type: MessageType): void {
    this.registerMessageBodyDeserializer(type, this._defaultBodyDeserializer);
  }

  static serialize(envelope: MessageEnvelope): any {
    var body: OutgoingProtocolMessage = envelope.body;
    var type: number = body.type;

    var serializer: MessageBodySerializer = this._serializers[type];
    if (serializer === undefined) {
      throw new Error(`No serializer set for message type: ${type}`);
    }

    var b: any = serializer(body);
    b.t = type;

    return {
      b: b,
      q: envelope.requestId,
      p: envelope.responseId
    };
  }


  static deserialize(message: any): MessageEnvelope {
    var body: any = message.b;
    var type: number = body.t;
    var requestId: number = message.q;
    var responseId: number = message.p;

    var deserializer: MessageBodyDeserializer = this._deserializers[type];
    if (deserializer === undefined) {
      throw new Error(`No deserializer set for message type: ${type}`);
    }

    var incomingMessage: IncomingProtocolMessage = deserializer(body);
    incomingMessage.type = type;

    return {
      body: incomingMessage,
      requestId: requestId,
      responseId: responseId
    };
  }
}
