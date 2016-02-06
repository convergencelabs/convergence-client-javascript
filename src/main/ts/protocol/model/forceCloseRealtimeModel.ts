import MessageType from "../MessageType";
import {IncomingProtocolNormalMessage} from "../protocol";

export interface ForceCloseRealTimeModelResponse extends IncomingProtocolNormalMessage {
  resourceId: string;
  reason: string;
}

export class ForceCloseRealTimeModelResponseMessageDeserializer {
  static deserialize(body: any): ForceCloseRealTimeModelResponse {
    return {
      resourceId: body.rId,
      reason: body.reason,
      type: MessageType.FORCE_CLOSE_REAL_TIME_MODEL
    };
  }
}
