import {MessageType} from "./MessageType";
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
import {SetReferenceSerializer} from "./model/reference/ReferenceEvent";
import {ClearReferenceMessageSerializer} from "./model/reference/ReferenceEvent";
import {UnpublishReferenceSerializer} from "./model/reference/ReferenceEvent";
import {RemoteReferenceSetDeserializer} from "./model/reference/ReferenceEvent";
import {RemoteReferencePublishedDeserializer} from "./model/reference/ReferenceEvent";
import {RemoteReferenceClearedDeserializer} from "./model/reference/ReferenceEvent";
import {RemoteReferenceUnpublishedDeserializer} from "./model/reference/ReferenceEvent";
import {PublishReferenceSerializer} from "./model/reference/ReferenceEvent";
import {RemoteClientOpenedModelDeserializer} from "./model/remoteOpenClose";
import {RemoteClientClosedModelDeserializer} from "./model/remoteOpenClose";
import {ActivityJoinRequestSerializer} from "./activity/joinActivity";
import {ActivityLeaveRequestSerializer} from "./activity/leaveActivity";
import {ActivitySetStateSerializer} from "./activity/activityState";
import {ActivityClearStateSerializer} from "./activity/activityState";
import {ActivitySessionJoinedDeserializer} from "./activity/sessionJoined";
import {ActivitySessionLeftDeserializer} from "./activity/sessionLeft";
import {ActivityRemoteStateSetDeserializer} from "./activity/activityState";
import {ActivityRemoteStateClearedDeserializer} from "./activity/activityState";
import {PresenceAvailabilityChangedDeserializer} from "./presence/pressenceAvailability";
import {
  PresenceStateClearedDeserializer, PresenceStateSetDeserializer,
  PresenceSetStateSerializer, PresenceClearStateSerializer
} from "./presence/presenceState";
import {UnsubscribePresenceSerializer} from "./presence/unsubscribePresence";
import {RequestPresenceSerializer, RequestPresenceResponseDeserializer} from "./presence/requestPresence";
import {SubscribePresenceRequestSerializer, SubscribePresenceResponseDeserializer} from "./presence/subscribePresence";
import {UserJoinedRoomMessageDeserializer} from "./chat/joinRoom";
import {UserLeftRoomMessageDeserializer} from "./chat/leaveRoom";
import {UserChatMessageDeserializer} from "./chat/chatMessage";
import {JoinRoomMessageSerializer} from "./chat/joinRoom";
import {LeaveRoomMessageSerializer} from "./chat/leaveRoom";
import {PublishChatMessageSerializer} from "./chat/chatMessage";
import {ParticipantsResponseDeserializer} from "./activity/participants";
import {ParticipantsRequestSerializer} from "./activity/participants";
import {ModelsQueryRequestSerializer} from "./model/query/modelQuery";
import {ModelsQueryResponseDeserializer} from "./model/query/modelQuery";


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

MessageSerializer.registerMessageBodySerializer(MessageType.PUBLISH_REFERENCE, PublishReferenceSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.SET_REFERENCE, SetReferenceSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.CLEAR_REFERENCE, ClearReferenceMessageSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.UNPUBLISH_REFERENCE, UnpublishReferenceSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.USER_LOOKUP_REQUEST, UserLookUpRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.USER_SEARCH_REQUEST, UserSearchRequestSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.ACTIVITY_PARTICIPANTS_REQUEST, ParticipantsRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.ACTIVITY_JOIN_REQUEST, ActivityJoinRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.ACTIVITY_LEAVE_REQUEST, ActivityLeaveRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.ACTIVITY_LOCAL_STATE_SET, ActivitySetStateSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.ACTIVITY_LOCAL_STATE_CLEARED, ActivityClearStateSerializer);


MessageSerializer.registerMessageBodySerializer(MessageType.PRESENCE_SET_STATE, PresenceSetStateSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.PRESENCE_CLEAR_STATE, PresenceClearStateSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.PRESENCE_REQUEST, RequestPresenceSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.PRESENCE_SUBSCRIBE_REQUEST, SubscribePresenceRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.PRESENCE_UNSUBSCRIBE, UnsubscribePresenceSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.JOIN_ROOM, JoinRoomMessageSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.LEAVE_ROOM, LeaveRoomMessageSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.PUBLISH_CHAT_MESSAGE, PublishChatMessageSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.MODELS_QUERY_REQUEST, ModelsQueryRequestSerializer);


// Deserializers
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.PING);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.PONG);

MessageSerializer.registerMessageBodyDeserializer(MessageType.AUTHENTICATE_RESPONSE, AuthenticationResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ERROR, ErrorMessageDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.OPEN_REAL_TIME_MODEL_RESPONSE, OpenRealTimeModelResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.MODEL_DATA_REQUEST, ModelDataRequestDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.OPERATION_ACKNOWLEDGEMENT, OperationAckDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REMOTE_OPERATION, RemoteOperationDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.REMOTE_CLIENT_OPENED, RemoteClientOpenedModelDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REMOTE_CLIENT_CLOSED, RemoteClientClosedModelDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.FORCE_CLOSE_REAL_TIME_MODEL, ForceCloseRealTimeModelDeserializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.DELETE_REAL_TIME_MODEL_RESPONSE);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.CREATE_REAL_TIME_MODEL_RESPONSE);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.CLOSE_REAL_TIME_MODEL_RESPONSE);

MessageSerializer.registerMessageBodyDeserializer(MessageType.REFERENCE_SET, RemoteReferenceSetDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REFERENCE_PUBLISHED, RemoteReferencePublishedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REFERENCE_CLEARED, RemoteReferenceClearedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REFERENCE_UNPUBLISHED, RemoteReferenceUnpublishedDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.USER_LIST_RESPONSE, UserListResponseDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_PARTICIPANTS_RESPONSE, ParticipantsResponseDeserializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.ACTIVITY_JOIN_RESPONSE);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.ACTIVITY_LEAVE_RESPONSE);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_SESSION_JOINED, ActivitySessionJoinedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_SESSION_LEFT, ActivitySessionLeftDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_REMOTE_STATE_SET, ActivityRemoteStateSetDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_REMOTE_STATE_CLEARED, ActivityRemoteStateClearedDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.PRESENCE_AVAILABILITY_CHANGED, PresenceAvailabilityChangedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.PRESENCE_STATE_SET, PresenceStateSetDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.PRESENCE_STATE_CLEARED, PresenceStateClearedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.PRESENCE_RESPONSE, RequestPresenceResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.PRESENCE_SUBSCRIBE_RESPONSE, SubscribePresenceResponseDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.USER_JOINED_ROOM, UserJoinedRoomMessageDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.USER_LEFT_ROOM, UserLeftRoomMessageDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.CHAT_MESSAGE_PUBLISHED, UserChatMessageDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.MODELS_QUERY_RESPONSE, ModelsQueryResponseDeserializer);
