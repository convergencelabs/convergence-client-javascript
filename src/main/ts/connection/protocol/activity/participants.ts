import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {MessageBodySerializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface ParticipantsRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

/**
 * @hidden
 * @internal
 */
export const ParticipantsRequestSerializer: MessageBodySerializer = (request: ParticipantsRequest) => {
  return {
    i: request.activityId
  };
};

/**
 * @hidden
 * @internal
 */
export interface ParticipantsResponse extends OutgoingProtocolRequestMessage {
  participants: ActivityParticipant;
}

/**
 * @hidden
 * @internal
 */
export const ParticipantsResponseDeserializer: MessageBodyDeserializer<ParticipantsResponse> = (body: any) => {
  const result: ParticipantsResponse = {
    participants: body.s
  };
  return result;
};

/**
 * Stored by session id, then key.
 * @hidden
 * @internal
 */
export type ActivityParticipant = Map<string, Map<string, any>>;
