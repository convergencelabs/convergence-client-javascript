import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {UserPresenceData} from "./requestPresence";

export interface SubscribePresenceRequest extends OutgoingProtocolRequestMessage {
  usernames: string[];
}

export const SubscribePresenceRequestSerializer: MessageBodySerializer = (request: SubscribePresenceRequest) => {
  return {
    u: request.usernames
  };
};

export interface SubscribePresenceResponse extends IncomingProtocolResponseMessage {
  userPresences: UserPresenceData[];
}

export const SubscribePresenceResponseDeserializer: MessageBodyDeserializer<SubscribePresenceResponse> =
  (body: any) => {
    const result: SubscribePresenceResponse = {
      userPresences: body.p
    };

    return result;
  };
