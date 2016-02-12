import MessageType from "../MessageType";
import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageSerializer} from "../MessageSerializer";

export interface ForceCloseRealTimeModel extends IncomingProtocolNormalMessage {
  resourceId: string;
  reason: string;
}

MessageSerializer.registerMessageBodyDeserializer(MessageType.FORCE_CLOSE_REAL_TIME_MODEL, (body: any) => {
  return {
    resourceId: body.r,
    reason: body.s
  };
});
