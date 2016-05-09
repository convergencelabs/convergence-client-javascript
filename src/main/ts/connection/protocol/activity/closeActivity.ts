import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../protocol";

export interface ActivityCloseRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

export var ActivityCloseRequestSerializer: MessageBodySerializer = (request: ActivityCloseRequest) => {
  return {
    i: request.activityId
  };
};

export interface ActivityCloseResponse extends IncomingProtocolResponseMessage {
}
