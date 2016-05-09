import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../protocol";

export interface ActivityJoinRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

export var ActivityJoinRequestSerializer: MessageBodySerializer = (request: ActivityJoinRequest) => {
  return {
    i: request.activityId
  };
};

export interface ActivityJoinResponse extends IncomingProtocolResponseMessage {
}
