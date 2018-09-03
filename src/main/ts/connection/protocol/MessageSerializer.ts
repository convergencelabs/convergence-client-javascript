import {MessageType} from "./MessageType";
import {MessageEnvelope} from "./protocol";
import {IncomingProtocolMessage} from "./protocol";
import {OutgoingProtocolMessage} from "./protocol";
import {HandshakeRequestSerializer} from "./handhsake";
import {HandshakeResponseDeserializer} from "./handhsake";
import {
  PasswordAuthRequestSerializer, AnonymousAuthRequestSerializer, ReconnectAuthRequestSerializer,
} from "./authentication";
import {TokenAuthRequestSerializer} from "./authentication";
import {AuthenticationResponseDeserializer} from "./authentication";
import {ErrorMessageSerializer} from "./ErrorMessage";
import {ErrorMessageDeserializer} from "./ErrorMessage";
import {OpenRealTimeModelRequestSerializer} from "./model/openRealtimeModel";
import {AutoCreateModelConfigRequestDeserializer} from "./model/autoCreateConfigRequest";
import {AutoCreateModelConfigResponseSerializer} from "./model/autoCreateConfigRequest";
import {OperationSubmissionSerializer} from "./model/operationSubmission";
import {OperationAckDeserializer} from "./model/operationAck";
import {RemoteOperationDeserializer} from "./model/remoteOperation";
import {ForceCloseRealTimeModelDeserializer} from "./model/forceCloseRealtimeModel";
import {DeleteRealTimeModelRequestSerializer} from "./model/deleteRealtimeModel";
import {
  CreateRealTimeModelRequestSerializer,
  CreateRealTimeModelResponseDeserializer
} from "./model/createRealtimeModel";
import {CloseRealTimeModelRequestSerializer} from "./model/closeRealtimeModel";
import {UserLookUpRequestSerializer} from "./identity/userLookUps";
import {UserSearchRequestSerializer} from "./identity/userLookUps";
import {UserListResponseDeserializer} from "./identity/userLookUps";
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
  PresenceSetStateSerializer, PresenceRemoveStateSerializer, PresenceStateRemovedDeserializer
} from "./presence/presenceState";
import {UnsubscribePresenceSerializer} from "./presence/unsubscribePresence";
import {RequestPresenceSerializer, RequestPresenceResponseDeserializer} from "./presence/requestPresence";
import {
  SubscribePresenceRequestSerializer,
  SubscribePresenceResponseDeserializer
} from "./presence/subscribePresence";
import {
  JoinChatChannelRequestMessageSerializer, AddUserToChatChannelMessageSerializer,
  UserJoinedChatChannelMessageDeserializer, JoinChatChannelResponseMessageDeserializer
} from "./chat/joining";
import {PublishChatMessageSerializer, RemoteChatMessageDeserializer} from "./chat/chatMessage";
import {ParticipantsResponseDeserializer} from "./activity/participants";
import {ParticipantsRequestSerializer} from "./activity/participants";
import {ModelsQueryRequestSerializer} from "./model/query/modelQuery";
import {ModelsQueryResponseDeserializer} from "./model/query/modelQuery";
import {HistoricalDataResponseDeserializer} from "./model/historical/historicalDataRequest";
import {HistoricalOperationsResponseDeserializer} from "./model/historical/historicalOperationsRequest";
import {HistoricalDataRequestSerializer} from "./model/historical/historicalDataRequest";
import {HistoricalOperationsRequestSerializer} from "./model/historical/historicalOperationsRequest";
import {ActivityRemoveStateSerializer} from "./activity/activityState";
import {ActivityRemoteStateRemovedDeserializer} from "./activity/activityState";
import {ActivityJoinResponseDeserializer} from "./activity/joinActivity";
import {
  GetModelPermissionsResponseDeserializer,
  GetModelPermissionsSerializer
} from "./model/permissions/getModelPermissions";
import {ModelPermissionsChangedDeserializer} from "./model/permissions/modelPermissionsChanged";
import {SetModelPermissionsSerializer} from "./model/permissions/setModelPermissions";
import {CreateChatChannelRequestMessageSerializer, CreateChatChannelResponseMessageDeserializer} from "./chat/create";
import {RemoveChatChannelRequestMessageSerializer} from "./chat/remove";
import {
  GetChatChannelsRequestMessageSerializer,
  GetDirectChannelsRequestMessage, GetChatChannelsResponseMessageDeserializer,
  ChatChannelExistsRequestMessageSerializer, ChatChannelExistsResponseMessageDeserializer
} from "./chat/getChannel";
import {
  LeaveChatChannelRequestMessageSerializer, RemoveUserFromChatChannelMessageSerializer,
  UserLeftChatChannelMessageDeserializer
} from "./chat/leaving";
import {SetChatChannelTopicMessageSerializer} from "./chat/setTopic";
import {SetChatChannelNameMessageSerializer} from "./chat/setName";
import {
  MarkChatChannelEventsSeenMessageSerializer,
  ChatChannelEventsMarkedSeenMessageDeserializer
} from "./chat/markSeen";
import {
  ChatChannelHistoryRequestMessageSerializer,
  ChatChannelHistoryResponseMessageDeserializer
} from "./chat/getHistory";
import {
  UserGroupsResponseDeserializer,
  UserGroupRequestSerializer, UserGroupsForUsersRequestSerializer, UserGroupsForUsersResponseDeserializer
} from "./identity/userGroups";
import {
  GetClientPermissionsRequestSerializer,
  GetClientPermissionsResponseDeserializer
} from "./permissions/getClientPermissions";
import {AddPermissionsRequestSerializer} from "./permissions/addPermissions";
import {RemovePermissionsRequestSerializer} from "./permissions/removePermissions";
import {SetPermissionsRequestSerializer} from "./permissions/setPermissions";
import {
  GetWorldPermissionsRequestSerializer,
  GetWorldPermissionsResponseDeserializer
} from "./permissions/getWorldPermissions";
import {GetAllUserPermissionsRequestSerializer} from "./permissions/getAllUserPermissions";
import {
  GetUserPermissionsRequestSerializer,
  GetUserPermissionsResponseDeserializer
} from "./permissions/getUserPermissions";
import {
  GetAllGroupPermissionsRequestSerializer,
  GetAllGroupPermissionsResponseDeserializer
} from "./permissions/getAllGroupPermissions";

/**
 * @hidden
 * @internal
 */
export type MessageBodySerializer = (message: OutgoingProtocolMessage) => any;

/**
 * @hidden
 * @internal
 */
export type MessageBodyDeserializer<T> = (message: any) => T;

/**
 * @hidden
 * @internal
 */
export class MessageSerializer {
  public static registerMessageBodySerializer(type: MessageType, serializer: MessageBodySerializer): void {
    if (this._serializers[type] !== undefined) {
      throw new Error(`No serializer for type ${MessageType[type]}`);
    }
    this._serializers[type] = serializer;
  }

  public static registerDefaultMessageBodySerializer(type: MessageType): void {
    this.registerMessageBodySerializer(type, this._defaultBodySerializer);
  }

  public static registerMessageBodyDeserializer(type: MessageType, deserializer: MessageBodyDeserializer<any>): void {
    if (this._deserializers[type] !== undefined) {
      throw new Error(`No deserializer for type ${MessageType[type]}`);
    }
    this._deserializers[type] = deserializer;
  }

  public static registerDefaultMessageBodyDeserializer(type: MessageType): void {
    this.registerMessageBodyDeserializer(type, this._defaultBodyDeserializer);
  }

  public static serialize(envelope: MessageEnvelope): any {
    const body: OutgoingProtocolMessage = envelope.body;
    const type: number = body.type;

    const serializer: MessageBodySerializer = this._serializers[type];
    if (serializer === undefined) {
      throw new Error(`No serializer set for message type: ${MessageType[type]}`);
    }

    const b: any = serializer(body);
    b.t = type;

    return {
      b,
      q: envelope.requestId,
      p: envelope.responseId
    };
  }

  public static deserialize(message: any): MessageEnvelope {
    const body: any = message.b;
    const type: number = body.t;
    const requestId: number = message.q;
    const responseId: number = message.p;

    const deserializer: MessageBodyDeserializer<any> = this._deserializers[type];
    if (deserializer === undefined) {
      throw new Error(`No deserializer set for message type: ${MessageType[type]}`);
    }

    const incomingMessage: IncomingProtocolMessage = deserializer(body);
    incomingMessage.type = type;

    return {
      body: incomingMessage,
      requestId,
      responseId
    };
  }

  private static _serializers: {[key: number]: MessageBodySerializer} = {};
  private static _deserializers: {[key: number]: MessageBodyDeserializer<any>} = {};

  private static _defaultBodyDeserializer: MessageBodyDeserializer<any> = (message: any) => {
    return {};
  }

  private static _defaultBodySerializer: MessageBodySerializer = (message: any) => {
    return {};
  }
}

// Serializers
MessageSerializer.registerDefaultMessageBodySerializer(MessageType.PING);
MessageSerializer.registerDefaultMessageBodySerializer(MessageType.PONG);

MessageSerializer.registerMessageBodySerializer(MessageType.HANDSHAKE_REQUEST, HandshakeRequestSerializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.HANDSHAKE_RESPONSE, HandshakeResponseDeserializer);

MessageSerializer.registerMessageBodySerializer(MessageType.PASSWORD_AUTH_REQUEST, PasswordAuthRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.TOKEN_AUTH_REQUEST, TokenAuthRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.ANONYMOUS_AUTH_REQUEST, AnonymousAuthRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.RECONNECT_AUTH_REQUEST, ReconnectAuthRequestSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.ERROR, ErrorMessageSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.OPEN_REAL_TIME_MODEL_REQUEST,
  OpenRealTimeModelRequestSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.MODEL_AUTO_CREATE_CONFIG_RESPONSE,
  AutoCreateModelConfigResponseSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.OPERATION_SUBMISSION, OperationSubmissionSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.DELETE_REAL_TIME_MODEL_REQUEST,
  DeleteRealTimeModelRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.CREATE_REAL_TIME_MODEL_REQUEST,
  CreateRealTimeModelRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.CLOSES_REAL_TIME_MODEL_REQUEST,
  CloseRealTimeModelRequestSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.GET_MODEL_PERMISSIONS_REQUEST,
  GetModelPermissionsSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.SET_MODEL_PERMISSIONS_REQUEST,
  SetModelPermissionsSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.PUBLISH_REFERENCE, PublishReferenceSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.SET_REFERENCE, SetReferenceSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.CLEAR_REFERENCE, ClearReferenceMessageSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.UNPUBLISH_REFERENCE, UnpublishReferenceSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.USER_LOOKUP_REQUEST, UserLookUpRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.USER_SEARCH_REQUEST, UserSearchRequestSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.ACTIVITY_PARTICIPANTS_REQUEST,
  ParticipantsRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.ACTIVITY_JOIN_REQUEST, ActivityJoinRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.ACTIVITY_LEAVE_REQUEST, ActivityLeaveRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.ACTIVITY_LOCAL_STATE_SET, ActivitySetStateSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.ACTIVITY_LOCAL_STATE_REMOVED,
  ActivityRemoveStateSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.ACTIVITY_LOCAL_STATE_CLEARED, ActivityClearStateSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.PRESENCE_SET_STATE, PresenceSetStateSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.PRESENCE_REMOVE_STATE, PresenceRemoveStateSerializer);
MessageSerializer.registerDefaultMessageBodySerializer(MessageType.PRESENCE_CLEAR_STATE);

MessageSerializer.registerMessageBodySerializer(MessageType.PRESENCE_REQUEST, RequestPresenceSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.PRESENCE_SUBSCRIBE_REQUEST,
  SubscribePresenceRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.PRESENCE_UNSUBSCRIBE, UnsubscribePresenceSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.MODELS_QUERY_REQUEST, ModelsQueryRequestSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.HISTORICAL_DATA_REQUEST, HistoricalDataRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.HISTORICAL_OPERATIONS_REQUEST,
  HistoricalOperationsRequestSerializer);

MessageSerializer.registerMessageBodySerializer(MessageType.GET_CLIENT_PERMISSIONS_REQUEST,
  GetClientPermissionsRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.ADD_PERMISSIONS_REQUEST,
  AddPermissionsRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.REMOVE_PERMISSIONS_REQUEST,
  RemovePermissionsRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.SET_PERMISSIONS_REQUEST,
  SetPermissionsRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.GET_WORLD_PERMISSIONS_REQUEST,
  GetWorldPermissionsRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.GET_ALL_USER_PERMISSIONS_REQUEST,
  GetAllUserPermissionsRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.GET_USER_PERMISSIONS_REQUEST,
  GetUserPermissionsRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.GET_ALL_GROUP_PERMISSIONS_REQUEST,
  GetAllGroupPermissionsRequestSerializer);
MessageSerializer.registerMessageBodySerializer(MessageType.GET_GROUP_PERMISSIONS_REQUEST,
  GetAllGroupPermissionsRequestSerializer);

// Deserializers
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.PING);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.PONG);

MessageSerializer.registerMessageBodyDeserializer(MessageType.AUTHENTICATE_RESPONSE,
  AuthenticationResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ERROR, ErrorMessageDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.CREATE_REAL_TIME_MODEL_RESPONSE,
  CreateRealTimeModelResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.OPEN_REAL_TIME_MODEL_RESPONSE,
  OpenRealTimeModelResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.MODEL_AUTO_CREATE_CONFIG_REQUEST,
  AutoCreateModelConfigRequestDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.OPERATION_ACKNOWLEDGEMENT, OperationAckDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REMOTE_OPERATION, RemoteOperationDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.REMOTE_CLIENT_OPENED,
  RemoteClientOpenedModelDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REMOTE_CLIENT_CLOSED,
  RemoteClientClosedModelDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.FORCE_CLOSE_REAL_TIME_MODEL,
  ForceCloseRealTimeModelDeserializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.DELETE_REAL_TIME_MODEL_RESPONSE);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.CLOSE_REAL_TIME_MODEL_RESPONSE);

MessageSerializer.registerMessageBodyDeserializer(MessageType.REFERENCE_SET, RemoteReferenceSetDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REFERENCE_PUBLISHED,
  RemoteReferencePublishedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REFERENCE_CLEARED, RemoteReferenceClearedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REFERENCE_UNPUBLISHED,
  RemoteReferenceUnpublishedDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.GET_MODEL_PERMISSIONS_RESPONSE,
  GetModelPermissionsResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.MODEL_PERMISSIONS_CHANGED,
  ModelPermissionsChangedDeserializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.SET_MODEL_PERMISSIONS_RESPONSE);

MessageSerializer.registerMessageBodyDeserializer(MessageType.USER_LIST_RESPONSE, UserListResponseDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_PARTICIPANTS_RESPONSE,
  ParticipantsResponseDeserializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.ACTIVITY_LEAVE_RESPONSE);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_JOIN_RESPONSE, ActivityJoinResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_SESSION_JOINED,
  ActivitySessionJoinedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_SESSION_LEFT, ActivitySessionLeftDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_REMOTE_STATE_SET,
  ActivityRemoteStateSetDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_REMOTE_STATE_REMOVED,
  ActivityRemoteStateRemovedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.ACTIVITY_REMOTE_STATE_CLEARED,
  ActivityRemoteStateClearedDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.PRESENCE_AVAILABILITY_CHANGED,
  PresenceAvailabilityChangedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.PRESENCE_STATE_SET, PresenceStateSetDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.PRESENCE_STATE_REMOVED, PresenceStateRemovedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.PRESENCE_STATE_CLEARED, PresenceStateClearedDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.PRESENCE_RESPONSE, RequestPresenceResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.PRESENCE_SUBSCRIBE_RESPONSE,
  SubscribePresenceResponseDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.MODELS_QUERY_RESPONSE, ModelsQueryResponseDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.HISTORICAL_DATA_RESPONSE,
  HistoricalDataResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.HISTORICAL_OPERATIONS_RESPONSE,
  HistoricalOperationsResponseDeserializer);

// Identity
MessageSerializer.registerMessageBodySerializer(MessageType.USER_GROUPS_REQUEST,
  UserGroupRequestSerializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.USER_GROUPS_RESPONSE,
  UserGroupsResponseDeserializer);

MessageSerializer.registerMessageBodySerializer(MessageType.USER_GROUPS_FOR_USERS_REQUEST,
  UserGroupsForUsersRequestSerializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.USER_GROUPS_FOR_USERS_RESPONSE,
  UserGroupsForUsersResponseDeserializer);

// Chat Messages
MessageSerializer.registerMessageBodySerializer(MessageType.CREATE_CHAT_CHANNEL_REQUEST,
  CreateChatChannelRequestMessageSerializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.CREATE_CHAT_CHANNEL_RESPONSE,
  CreateChatChannelResponseMessageDeserializer);

MessageSerializer.registerMessageBodySerializer(MessageType.REMOVE_CHAT_CHANNEL_REQUEST,
  RemoveChatChannelRequestMessageSerializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.REMOVE_CHAT_CHANNEL_RESPONSE);

MessageSerializer.registerMessageBodySerializer(MessageType.GET_CHAT_CHANNELS_REQUEST,
  GetChatChannelsRequestMessageSerializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.GET_CHAT_CHANNELS_RESPONSE,
  GetChatChannelsResponseMessageDeserializer);

MessageSerializer.registerMessageBodySerializer(MessageType.GET_DIRECT_CHAT_CHANNELS_REQUEST,
  GetDirectChannelsRequestMessage);
MessageSerializer.registerMessageBodyDeserializer(MessageType.GET_DIRECT_CHAT_CHANNELS_RESPONSE,
  GetChatChannelsResponseMessageDeserializer);

MessageSerializer.registerDefaultMessageBodySerializer(MessageType.GET_JOINED_CHAT_CHANNELS_REQUEST);
MessageSerializer.registerMessageBodyDeserializer(MessageType.GET_JOINED_CHAT_CHANNELS_RESPONSE,
  GetChatChannelsResponseMessageDeserializer);

MessageSerializer.registerDefaultMessageBodySerializer(MessageType.SEARCH_CHAT_CHANNELS_REQUEST);
MessageSerializer.registerMessageBodyDeserializer(MessageType.SEARCH_CHAT_CHANNELS_RESPONSE,
  GetChatChannelsResponseMessageDeserializer);

MessageSerializer.registerMessageBodySerializer(MessageType.JOIN_CHAT_CHANNEL_REQUEST,
  JoinChatChannelRequestMessageSerializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.JOIN_CHAT_CHANNEL_RESPONSE,
  JoinChatChannelResponseMessageDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.USER_JOINED_CHAT_CHANNEL,
  UserJoinedChatChannelMessageDeserializer);

MessageSerializer.registerMessageBodySerializer(MessageType.LEAVE_CHAT_CHANNEL_REQUEST,
  LeaveChatChannelRequestMessageSerializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.LEAVE_CHAT_CHANNEL_RESPONSE);
MessageSerializer.registerMessageBodyDeserializer(MessageType.USER_LEFT_CHAT_CHANNEL,
  UserLeftChatChannelMessageDeserializer);

MessageSerializer.registerMessageBodySerializer(MessageType.ADD_USER_TO_CHAT_CHANNEL_REQUEST,
  AddUserToChatChannelMessageSerializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.ADD_USER_TO_CHAT_CHANNEL_RESPONSE);

MessageSerializer.registerMessageBodySerializer(MessageType.REMOVE_USER_FROM_CHAT_CHANNEL_REQUEST,
  RemoveUserFromChatChannelMessageSerializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.REMOVE_USER_FROM_CHAT_CHANNEL_RESPONSE);

MessageSerializer.registerMessageBodySerializer(MessageType.SET_CHAT_CHANNEL_NAME_REQUEST,
  SetChatChannelNameMessageSerializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.SET_CHAT_CHANNEL_NAME_RESPONSE);

MessageSerializer.registerMessageBodySerializer(MessageType.SET_CHAT_CHANNEL_TOPIC_REQUEST,
  SetChatChannelTopicMessageSerializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.SET_CHAT_CHANNEL_TOPIC_RESPONSE);

MessageSerializer.registerMessageBodySerializer(MessageType.MARK_CHAT_CHANNEL_EVENTS_SEEN_REQUEST,
  MarkChatChannelEventsSeenMessageSerializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.MARK_CHAT_CHANNEL_EVENTS_SEEN_RESPONSE);
MessageSerializer.registerMessageBodyDeserializer(MessageType.CHAT_CHANNEL_EVENTS_MARKED_SEEN,
  ChatChannelEventsMarkedSeenMessageDeserializer);

MessageSerializer.registerMessageBodySerializer(MessageType.PUBLISH_CHAT_MESSAGE_REQUEST,
  PublishChatMessageSerializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.PUBLISH_CHAT_MESSAGE_RESPONSE);
MessageSerializer.registerMessageBodyDeserializer(MessageType.REMOTE_CHAT_MESSAGE,
  RemoteChatMessageDeserializer);

MessageSerializer.registerMessageBodySerializer(MessageType.GET_CHAT_CHANNEL_HISTORY_REQUEST,
  ChatChannelHistoryRequestMessageSerializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.GET_CHAT_CHANNEL_HISTORY_RESPONSE,
  ChatChannelHistoryResponseMessageDeserializer);

MessageSerializer.registerMessageBodySerializer(MessageType.CHAT_CHANNEL_EXISTS_REQUEST,
  ChatChannelExistsRequestMessageSerializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.CHAT_CHANNEL_EXISTS_RESPONSE,
  ChatChannelExistsResponseMessageDeserializer);

MessageSerializer.registerMessageBodyDeserializer(MessageType.GET_CLIENT_PERMISSIONS_RESPONSE,
  GetClientPermissionsResponseDeserializer);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.ADD_PERMISSIONS_RESPONSE);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.REMOVE_PERMISSIONS_RESPONSE);
MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.SET_PERMISSIONS_RESPONSE);
MessageSerializer.registerMessageBodyDeserializer(MessageType.GET_WORLD_PERMISSIONS_RESPONSE,
  GetWorldPermissionsResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.GET_ALL_USER_PERMISSIONS_RESPONSE,
  GetAllGroupPermissionsResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.GET_USER_PERMISSIONS_RESPONSE,
  GetUserPermissionsResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.GET_ALL_GROUP_PERMISSIONS_RESPONSE,
  GetAllGroupPermissionsResponseDeserializer);
MessageSerializer.registerMessageBodyDeserializer(MessageType.GET_GROUP_PERMISSIONS_RESPONSE,
  GetAllGroupPermissionsResponseDeserializer);
