import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface ForceCloseRealTimeModel extends IncomingProtocolNormalMessage {
  resourceId: string;
  reason: string;
}

export var ForceCloseRealTimeModelDesrializer: MessageBodyDeserializer =  (body: any) => {
  return {
    resourceId: body.r,
    reason: body.s
  };
};
