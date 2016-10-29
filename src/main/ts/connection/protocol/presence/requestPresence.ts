import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface RequestPresence extends OutgoingProtocolRequestMessage {
  usernames: string[];
}

export var RequestPresenceSerializer: MessageBodySerializer = (request: RequestPresence) => {
  return {
    u: request.usernames
  };
};

export interface RequestPresenceResponse extends IncomingProtocolNormalMessage {
  userPresences: UserPresenceData[];
}

export var RequestPresenceResponseDeserializer: MessageBodyDeserializer<RequestPresenceResponse> = (body: any) => {
  const result: RequestPresenceResponse = {
    userPresences: body.p
  };
  return result;
};

export interface UserPresenceData {
  username: string;
  available: boolean;
  state: {[key: string]: any};
}
