import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {MessageBodySerializer} from "../MessageSerializer";

export interface ParticipantsRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

export var ParticipantsRequestSerializer: MessageBodySerializer = (request: ParticipantsRequest) => {
  return {
    i: request.activityId
  };
};

export interface ParticipantsResponse extends OutgoingProtocolRequestMessage {
  participants: ActivityParticipant;
}

export var ParticipantsResponseDeserializer: MessageBodyDeserializer<ParticipantsResponse> = (body: any) => {
  var result: ParticipantsResponse = {
    participants: body.s
  };
  return result;
};


/**
 * Stored by session id, then key.
 */
export type ActivityParticipant = {[key: string]: {[key: string]: any}};
