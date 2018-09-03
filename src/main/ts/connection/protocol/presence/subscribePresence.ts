import {OutgoingProtocolRequestMessage, IncomingProtocolResponseMessage} from "../protocol";
import {MessageBodySerializer, MessageBodyDeserializer} from "../MessageSerializer";
import {UserPresenceData} from "./requestPresence";

/**
 * @hidden
 * @internal
 */
export interface SubscribePresenceRequest extends OutgoingProtocolRequestMessage {
  usernames: string[];
}

/**
 * @hidden
 * @internal
 */
export const SubscribePresenceRequestSerializer: MessageBodySerializer = (request: SubscribePresenceRequest) => {
  return {
    u: request.usernames
  };
};

/**
 * @hidden
 * @internal
 */
export interface SubscribePresenceResponse extends IncomingProtocolResponseMessage {
  userPresences: UserPresenceData[];
}

/**
 * @hidden
 * @internal
 */
export const SubscribePresenceResponseDeserializer: MessageBodyDeserializer<SubscribePresenceResponse> =
  (body: any) => {
    const result: SubscribePresenceResponse = {
      userPresences: body.p
    };

    return result;
  };
