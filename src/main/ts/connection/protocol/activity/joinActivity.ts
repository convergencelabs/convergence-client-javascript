import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface ActivityJoinRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
  state: Map<string, any>;
}

export const ActivityJoinRequestSerializer: MessageBodySerializer = (request: ActivityJoinRequest) => {
  return {
    i: request.activityId,
    s: request.state
  };
};

export interface ActivityJoinResponse extends IncomingProtocolResponseMessage {
  participants: {[key: string]: any};
}

export const ActivityJoinResponseDeserializer: MessageBodyDeserializer<ActivityJoinResponse> = (body: any) => {
  const participants: {[key: string]: any} = body.s;
  const result: ActivityJoinResponse = {participants};
  return result;
};
