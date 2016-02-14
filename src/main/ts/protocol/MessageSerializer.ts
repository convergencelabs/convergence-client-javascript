import MessageType from "./MessageType";
import {MessageEnvelope} from "./protocol";
import {IncomingProtocolMessage} from "./protocol";
import {OutgoingProtocolMessage} from "./protocol";

import {HandshakeRequestSerializer} from "./handhsake";
import {HandshakeResponseDeserializer} from "./handhsake";
import {PasswordAuthRequestSerializer} from "./authentication";
import {TokenAuthRequestSerializer} from "./authentication";
import {AuthenticationResponseDeserializer} from "./authentication";
import {ErrorMessageSerializer} from "./ErrorMessage";
import {ErrorMessageDeserializer} from "./ErrorMessage";
import {OpenRealTimeModelRequestDesrializer} from "./model/openRealtimeModel";
import {OpenRealTimeModelRequestSerializer} from "./model/openRealtimeModel";
import {ModelDataRequestDeserializer} from "./model/modelDataRequest";
import {ModelDataResponseSerializer} from "./model/modelDataRequest";
import {OperationSubmissionSerializer} from "./model/operationSubmission";
import {OperationAckDesrializer} from "./model/operationAck";
import {RemoteOperationDesrializer} from "./model/remoteOperation";
import {ForceCloseRealTimeModelDesrializer} from "./model/forceCloseRealtimeModel";
import {DeleteRealTimeModelRequestSerializer} from "./model/deleteRealtimeModel";
import {CreateRealTimeModelRequestSerializer} from "./model/createRealtimeModel";
import {CloseRealTimeModelRequestSerializer} from "./model/closeRealtimeModel";

export type MessageBodySerializer = (message: OutgoingProtocolMessage) => any;
export type MessageBodyDeserializer = (message: any) => IncomingProtocolMessage;

export class MessageSerializer {

  private static _serializers: {[key: number]: MessageBodySerializer} = {};
  private static _deserializers: {[key: number]: MessageBodyDeserializer} = {};

  private static _defaultBodyDeserializer: MessageBodyDeserializer = (message: any) => {
    return {};
  };

  private static _defaultBodySerializer: MessageBodySerializer = (message: any) => {
    return {};
  };

  static registerMessageBodySerializer(type: MessageType, serializer: MessageBodySerializer): void {
    if (this._serializers[type] !== undefined) {
      throw new Error(`Serializer for type ${MessageType[type]}`);
    }
    this._serializers[type] = serializer;
  }

  static registerDefaultMessageBodySerializer(type: MessageType): void {
    this.registerMessageBodySerializer(type, this._defaultBodySerializer);
  }

  static registerMessageBodyDeserializer(type: MessageType, deserializer: MessageBodyDeserializer): void {
    if (this._deserializers[type] !== undefined) {
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

// Serializers
MessageSerializer.registerDefaultMessageBodySerializer(MessageType.PING);
MessageSerializer.registerDefaultMessageBodySerializer(MessageType.PONG);

MessageSerializer.registerMessageBodySerializer(MessageType.HANDSHAKE_REQUEST, HandshakeRequestSerializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.HANDSHAKE_RESPONSE, HandshakeResponseDeserializer);

MessageSerializer.registerMessageBodySerializer(MessageType.PASSWORD_AUTH_REQUEST, PasswordAuthRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.TOKEN_AUTH_REQUEST, TokenAuthRequestSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.ERROR, ErrorMessageSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.OPEN_REAL_TIME_MODEL_REQUEST, OpenRealTimeModelRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.MODEL_DATA_RESPONSE, ModelDataResponseSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.OPERATION_SUBMISSION, OperationSubmissionSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.DELETE_REAL_TIME_MODEL_REQUEST, DeleteRealTimeModelRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.CREATE_REAL_TIME_MODEL_REQUEST, CreateRealTimeModelRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.CLOSES_REAL_TIME_MODEL_REQUEST, CloseRealTimeModelRequestSerializer);

// Deserializers
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.PING);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.PONG);

MessageSerializer.registerMessageBodyDeserializer(MessageType.AUTHENTICATE_RESPONSE, AuthenticationResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ERROR, ErrorMessageDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.OPEN_REAL_TIME_MODEL_RESPONSE, OpenRealTimeModelRequestDesrializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.MODEL_DATA_REQUEST, ModelDataRequestDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.OPERATION_ACKNOWLEDGEMENT, OperationAckDesrializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REMOTE_OPERATION, RemoteOperationDesrializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.FORCE_CLOSE_REAL_TIME_MODEL, ForceCloseRealTimeModelDesrializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.DELETE_REAL_TIME_MODEL_RESPONSE);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.CREATE_REAL_TIME_MODEL_RESPONSE);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.CLOSE_REAL_TIME_MODEL_RESPONSE);
