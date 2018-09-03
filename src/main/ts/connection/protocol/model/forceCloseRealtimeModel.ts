import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface ForceCloseRealTimeModel extends IncomingProtocolNormalMessage {
  resourceId: string;
  reason: string;
}

/**
 * @hidden
 * @internal
 */
export const ForceCloseRealTimeModelDeserializer: MessageBodyDeserializer<ForceCloseRealTimeModel> =  (body: any) => {
  return {
    resourceId: body.r,
    reason: body.s
  };
};
