import {OutgoingProtocolRequestMessage} from "../protocol";
import MessageType from "../MessageType";

export interface CloseRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  resourceId: string;
}

export class CloseRealTimeModelRequestSerializer {
  static serialize(request: CloseRealTimeModelRequest): any {
    return {
      rId: request.resourceId,
      type: MessageType.CLOSE_REAL_TIME_MODEL
    };
  }
}
