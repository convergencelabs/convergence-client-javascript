export enum MessageType {
  ERROR = 0,

  PING = 1,
  PONG = 2,

  HANDSHAKE_REQUEST = 3,
  HANDSHAKE_RESPONSE = 4,

  PASSWORD_AUTH_REQUEST = 5,
  TOKEN_AUTH_REQUEST = 6,
  ANONYMOUS_AUTH_REQUEST = 7,

  AUTHENTICATE_RESPONSE = 10,

    //
    // Models
    //

  OPEN_REAL_TIME_MODEL_REQUEST = 100,
  OPEN_REAL_TIME_MODEL_RESPONSE = 101,

  CLOSES_REAL_TIME_MODEL_REQUEST = 102,
  CLOSE_REAL_TIME_MODEL_RESPONSE = 103,

  CREATE_REAL_TIME_MODEL_REQUEST = 104,
  CREATE_REAL_TIME_MODEL_RESPONSE = 105,

  DELETE_REAL_TIME_MODEL_REQUEST = 106,
  DELETE_REAL_TIME_MODEL_RESPONSE = 107,

  FORCE_CLOSE_REAL_TIME_MODEL = 108,

  REMOTE_CLIENT_OPENED = 109,
  REMOTE_CLIENT_CLOSED = 110,

  MODEL_AUTO_CREATE_CONFIG_REQUEST = 111,
  MODEL_AUTO_CREATE_CONFIG_RESPONSE = 112,

  REMOTE_OPERATION = 113,
  OPERATION_SUBMISSION = 114,
  OPERATION_ACKNOWLEDGEMENT = 115,

  PUBLISH_REFERENCE = 116,
  SET_REFERENCE = 117,
  CLEAR_REFERENCE = 118,
  UNPUBLISH_REFERENCE = 119,

  REFERENCE_PUBLISHED = 120,
  REFERENCE_SET = 121,
  REFERENCE_CLEARED = 122,
  REFERENCE_UNPUBLISHED = 123,

  MODELS_QUERY_REQUEST = 124,
  MODELS_QUERY_RESPONSE = 125,

  HISTORICAL_DATA_REQUEST = 126,
  HISTORICAL_DATA_RESPONSE = 127,

  HISTORICAL_OPERATIONS_REQUEST = 128,
  HISTORICAL_OPERATIONS_RESPONSE = 129,

  GET_MODEL_PERMISSIONS_REQUEST = 130,
  GET_MODEL_PERMISSIONS_RESPONSE = 131,

  SET_MODEL_PERMISSIONS_REQUEST = 132,
  SET_MODEL_PERMISSIONS_RESPONSE = 133,

  MODEL_PERMISSIONS_CHANGED = 134,

    //
    // Identity
    //

  USER_LOOKUP_REQUEST = 200,
  USER_SEARCH_REQUEST = 201,
  USER_LIST_RESPONSE = 202,

    //
    // Activity
    //

  ACTIVITY_PARTICIPANTS_REQUEST = 300,
  ACTIVITY_PARTICIPANTS_RESPONSE = 301,

  ACTIVITY_JOIN_REQUEST = 302,
  ACTIVITY_JOIN_RESPONSE = 303,

  ACTIVITY_LEAVE_REQUEST = 304,
  ACTIVITY_LEAVE_RESPONSE = 305,

  ACTIVITY_SESSION_JOINED = 306,
  ACTIVITY_SESSION_LEFT = 307,

  ACTIVITY_LOCAL_STATE_SET = 308,
  ACTIVITY_LOCAL_STATE_REMOVED = 309,
  ACTIVITY_LOCAL_STATE_CLEARED = 310,

  ACTIVITY_REMOTE_STATE_SET = 311,
  ACTIVITY_REMOTE_STATE_REMOVED = 312,
  ACTIVITY_REMOTE_STATE_CLEARED = 313,

    //
    // Presence
    //

  PRESENCE_SET_STATE = 400,
  PRESENCE_REMOVE_STATE = 401,
  PRESENCE_CLEAR_STATE = 402,

  PRESENCE_STATE_SET = 403,
  PRESENCE_STATE_CLEARED = 404,
  PRESENCE_STATE_REMOVED = 405,

  PRESENCE_AVAILABILITY_CHANGED = 406,

  PRESENCE_REQUEST = 407,
  PRESENCE_RESPONSE = 408,

  PRESENCE_SUBSCRIBE_REQUEST = 409,
  PRESENCE_SUBSCRIBE_RESPONSE = 410,
  PRESENCE_UNSUBSCRIBE = 411,

    //
    // Chat
    //

  CREATE_CHAT_CHANNEL_REQUEST = 500,
  CREATE_CHAT_CHANNEL_RESPONSE = 501,

  REMOVE_CHAT_CHANNEL_REQUEST = 502,
  REMOVE_CHAT_CHANNEL_RESPONSE = 503,
  CHAT_CHANNEL_REMOVED = 504,

  GET_CHAT_CHANNELS_REQUEST = 505,
  GET_CHAT_CHANNELS_RESPONSE = 506,

  GET_DIRECT_CHAT_CHANNELS_REQUEST = 507,
  GET_DIRECT_CHAT_CHANNELS_RESPONSE = 508,

  GET_JOINED_CHAT_CHANNELS_REQUEST = 509,
  GET_JOINED_CHAT_CHANNELS_RESPONSE = 510,

  SEARCH_CHAT_CHANNELS_REQUEST = 511,
  SEARCH_CHAT_CHANNELS_RESPONSE = 512,

  JOIN_CHAT_CHANNEL_REQUEST = 513,
  JOIN_CHAT_CHANNEL_RESPONSE = 514,
  USER_JOINED_CHAT_CHANNEL = 515,

  LEAVE_CHAT_CHANNEL_REQUEST = 516,
  LEAVE_CHAT_CHANNEL_RESPONSE = 517,
  USER_LEFT_CHAT_CHANNEL = 518,

  ADD_USER_TO_CHAT_CHANNEL_REQUEST = 519,
  ADD_USER_TO_CHAT_CHANNEL_RESPONSE = 520,
  USER_ADDED_TO_CHAT_CHANNEL = 521,

  REMOVE_USER_FROM_CHAT_CHANNEL_REQUEST = 522,
  REMOVE_USER_FROM_CHAT_CHANNEL_RESPONSE = 523,
  USER_REMOVED_FROM_CHAT_CHANNEL = 524,

  SET_CHAT_CHANNEL_NAME_REQUEST = 525,
  SET_CHAT_CHANNEL_NAME_RESPONSE = 526,
  CHAT_CHANNEL_NAME_CHANGED = 527,

  SET_CHAT_CHANNEL_TOPIC_REQUEST = 528,
  SET_CHAT_CHANNEL_TOPIC_RESPONSE = 529,
  CHAT_CHANNEL_TOPIC_CHANGED = 530,

  MARK_CHAT_CHANNEL_EVENTS_SEEN_REQUEST = 531,
  MARK_CHAT_CHANNEL_EVENTS_SEEN_RESPONSE = 532,
  CHAT_CHANNEL_EVENTS_MARKED_SEEN = 533,

  PUBLISH_CHAT_MESSAGE_REQUEST = 534,
  PUBLISH_CHAT_MESSAGE_RESPONSE = 535,
  REMOTE_CHAT_MESSAGE = 536,

  GET_CHAT_CHANNEL_HISTORY_REQUEST = 537,
  GET_CHAT_CHANNEL_HISTORY_RESPONSE = 538,
}
