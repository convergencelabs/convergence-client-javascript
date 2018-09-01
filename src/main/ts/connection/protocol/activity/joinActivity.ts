import {OutgoingProtocolRequestMessage, IncomingProtocolResponseMessage} from "../protocol";
import {MessageBodySerializer, MessageBodyDeserializer} from "../MessageSerializer";
import {StringMap} from "../../../util/";

export interface ActivityJoinRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
  state: Map<string, any>;
}

export const ActivityJoinRequestSerializer: MessageBodySerializer = (request: ActivityJoinRequest) => {
  return {
    i: request.activityId,
    s: StringMap.mapToObject(request.state)
  };
};

export interface ActivityJoinResponse extends IncomingProtocolResponseMessage {
  participants: {[key: string]: any};
}

export const ActivityJoinResponseDeserializer: MessageBodyDeserializer<ActivityJoinResponse> = (body: any) => {
  const participants: {[key: string]: any} = body.s;
  return {participants} as ActivityJoinResponse;
};
