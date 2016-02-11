import MessageType from "../MessageType";
import {IncomingProtocolNormalMessage} from "../protocol";

export interface ForceCloseRealTimeModel extends IncomingProtocolNormalMessage {
  resourceId: string;
  reason: string;
}

export class ForceCloseRealTimeModelMessageDeserializer {
  static deserialize(body: any): ForceCloseRealTimeModel {
    return {
      type: MessageType.FORCE_CLOSE_REAL_TIME_MODEL,
      resourceId: body.r,
      reason: body.s

    };
  }
}
