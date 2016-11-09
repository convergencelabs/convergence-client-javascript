import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface PresenceAvailabilityChanged extends IncomingProtocolNormalMessage {
  username: string;
  available: boolean;
}

export var PresenceAvailabilityChangedDeserializer: MessageBodyDeserializer<PresenceAvailabilityChanged> =
  (body: any) => {
    const result: PresenceAvailabilityChanged = {
      username: body.u,
      available: body.a
    };
    return result;
  };
