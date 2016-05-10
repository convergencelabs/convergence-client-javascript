import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {MessageBodySerializer} from "../MessageSerializer";

export interface ActivityOpenRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

export var ActivityOpenRequestSerializer: MessageBodySerializer = (request: ActivityOpenRequest) => {
  return {
    i: request.activityId
  };
};

export interface ActivityOpenResponse extends OutgoingProtocolRequestMessage {
  state: ActivityState;
}

export var ActivityOpenResponseDeserializer: MessageBodyDeserializer<ActivityOpenResponse> = (body: any) => {
  var result: ActivityOpenResponse = {
    state: body.s
  };
  return result;
};


/**
 * Stored by session id, then key.
 */
export type ActivityState = {[key: string]: {[key: string]: any}};
