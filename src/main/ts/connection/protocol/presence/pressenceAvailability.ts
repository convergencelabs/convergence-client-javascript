import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface PresenceAvailabilityChanged extends IncomingProtocolNormalMessage {
  username: string;
  available: boolean;
}

/**
 * @hidden
 * @internal
 */
export const PresenceAvailabilityChangedDeserializer: MessageBodyDeserializer<PresenceAvailabilityChanged> =
  (body: any) => {
    const result: PresenceAvailabilityChanged = {
      username: body.u,
      available: body.a
    };
    return result;
  };
