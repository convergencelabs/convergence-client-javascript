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
import {OpenRealTimeModelRequestSerializer} from "./model/openRealtimeModel";
import {ModelDataRequestDeserializer} from "./model/modelDataRequest";
import {ModelDataResponseSerializer} from "./model/modelDataRequest";
import {OperationSubmissionSerializer} from "./model/operationSubmission";
import {OperationAckDeserializer} from "./model/operationAck";
import {RemoteOperationDeserializer} from "./model/remoteOperation";
import {ForceCloseRealTimeModelDeserializer} from "./model/forceCloseRealtimeModel";
import {DeleteRealTimeModelRequestSerializer} from "./model/deleteRealtimeModel";
import {CreateRealTimeModelRequestSerializer} from "./model/createRealtimeModel";
import {CloseRealTimeModelRequestSerializer} from "./model/closeRealtimeModel";
import {UserLookUpRequestSerializer} from "./user/userLookUps";
import {UserSearchRequestSerializer} from "./user/userLookUps";
import {UserListResponseDeserializer} from "./user/userLookUps";
import {OpenRealTimeModelResponseDeserializer} from "./model/openRealtimeModel";

export type MessageBodySerializer = (message: OutgoingProtocolMessage) => any;
export type MessageBodyDeserializer<T> = (message: any) => T;

export class MessageSerializer {

  private static _serializers: {[key: number]: MessageBodySerializer} = {};
  private static _deserializers: {[key: number]: MessageBodyDeserializer<any>} = {};

  private static _defaultBodyDeserializer: MessageBodyDeserializer<any> = (message: any) => {
    return {};
  };

  private static _defaultBodySerializer: MessageBodySerializer = (message: any) => {
    return {};
  };

  static registerMessageBodySerializer(type: MessageType, serializer: MessageBodySerializer): void {
    if (this._serializers[type] !== undefined) {
      throw new Error(`No serializer for type ${MessageType[type]}`);
    }
    this._serializers[type] = serializer;
  }

  static registerDefaultMessageBodySerializer(type: MessageType): void {
    this.registerMessageBodySerializer(type, this._defaultBodySerializer);
  }

  static registerMessageBodyDeserializer(type: MessageType, deserializer: MessageBodyDeserializer<any>): void {
    if (this._deserializers[type] !== undefined) {
      throw new Error(`No deserializer for type ${MessageType[type]}`);
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
      throw new Error(`No serializer set for message type: ${MessageType[type]}`);
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

    var deserializer: MessageBodyDeserializer<any> = this._deserializers[type];
    if (deserializer === undefined) {
      throw new Error(`No deserializer set for message type: ${MessageType[type]}`);
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

MessageSerializer.registerMessageBodySerializer(MessageType.USER_LOOKUP_REQUEST, UserLookUpRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.USER_SEARCH_REQUEST, UserSearchRequestSerializer);

// Deserializers
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.PING);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.PONG);

MessageSerializer.registerMessageBodyDeserializer(MessageType.AUTHENTICATE_RESPONSE, AuthenticationResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ERROR, ErrorMessageDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.OPEN_REAL_TIME_MODEL_RESPONSE, OpenRealTimeModelResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.MODEL_DATA_REQUEST, ModelDataRequestDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.OPERATION_ACKNOWLEDGEMENT, OperationAckDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REMOTE_OPERATION, RemoteOperationDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.FORCE_CLOSE_REAL_TIME_MODEL, ForceCloseRealTimeModelDeserializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.DELETE_REAL_TIME_MODEL_RESPONSE);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.CREATE_REAL_TIME_MODEL_RESPONSE);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.CLOSE_REAL_TIME_MODEL_RESPONSE);

MessageSerializer.registerMessageBodyDeserializer(MessageType.USER_LIST_RESPONSE, UserListResponseDeserializer);
