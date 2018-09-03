import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodyDeserializer, MessageBodySerializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface ActivityOpenRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

/**
 * @hidden
 * @internal
 */
export const ActivityOpenRequestSerializer: MessageBodySerializer = (request: ActivityOpenRequest) => {
  return {
    i: request.activityId
  };
};

/**
 * @hidden
 * @internal
 */
export interface ActivityOpenResponse extends OutgoingProtocolRequestMessage {
  state: ActivityState;
}

/**
 * @hidden
 * @internal
 */
export const ActivityOpenResponseDeserializer: MessageBodyDeserializer<ActivityOpenResponse> = (body: any) => {
  const result: ActivityOpenResponse = {
    state: body.s
  };
  return result;
};

/**
 * @hidden
 * @internal
 * Stored by session id, then key.
 */
export interface ActivityState {
  [index: string]: {[key: string]: any};
}
