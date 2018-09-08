import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer, MessageBodyDeserializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface RequestPresence extends OutgoingProtocolRequestMessage {
  usernames: string[];
}

/**
 * @hidden
 * @internal
 */
export const RequestPresenceSerializer: MessageBodySerializer = (request: RequestPresence) => {
  return {
    u: request.usernames
  };
};

/**
 * @hidden
 * @internal
 */
export interface RequestPresenceResponse extends IncomingProtocolNormalMessage {
  userPresences: UserPresenceData[];
}

/**
 * @hidden
 * @internal
 */
export const RequestPresenceResponseDeserializer: MessageBodyDeserializer<RequestPresenceResponse> = (body: any) => {
  const result: RequestPresenceResponse = {
    userPresences: body.p
  };
  return result;
};

/**
 * @hidden
 * @internal
 */
export interface UserPresenceData {
  username: string;
  available: boolean;
  state: {[key: string]: any};
}
