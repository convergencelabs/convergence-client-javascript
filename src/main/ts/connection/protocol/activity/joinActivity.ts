import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../protocol";
import {ActivityParticipant} from "../../../activity/ActivityParticipant";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface ActivityJoinRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
  state: Map<string, any>;
}

export var ActivityJoinRequestSerializer: MessageBodySerializer = (request: ActivityJoinRequest) => {
  return {
    i: request.activityId,
    s: request.state
  };
};

export interface ActivityJoinResponse extends IncomingProtocolResponseMessage {
  participants: ActivityParticipant;
}

export var ActivityJoinResponseDeserializer: MessageBodyDeserializer<ActivityJoinResponse> = (body: any) => {
  var result: ActivityJoinResponse = {
    participants: body.s
  };
  return result;
};
