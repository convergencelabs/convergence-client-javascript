import {OutgoingProtocolRequestMessage, IncomingProtocolResponseMessage} from "../protocol";
import {MessageBodySerializer, MessageBodyDeserializer} from "../MessageSerializer";
import {StringMap} from "../../../util/";

/**
 * @hidden
 * @internal
 */
export interface ActivityJoinRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
  state: Map<string, any>;
}

/**
 * @hidden
 * @internal
 */
export const ActivityJoinRequestSerializer: MessageBodySerializer = (request: ActivityJoinRequest) => {
  return {
    i: request.activityId,
    s: StringMap.mapToObject(request.state)
  };
};

/**
 * @hidden
 * @internal
 */
export interface ActivityJoinResponse extends IncomingProtocolResponseMessage {
  participants: {[key: string]: any};
}

/**
 * @hidden
 * @internal
 */
export const ActivityJoinResponseDeserializer: MessageBodyDeserializer<ActivityJoinResponse> = (body: any) => {
  const participants: {[key: string]: any} = body.s;
  return {participants} as ActivityJoinResponse;
};
