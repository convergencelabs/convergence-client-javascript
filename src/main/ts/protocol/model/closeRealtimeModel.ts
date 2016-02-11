import {OutgoingProtocolRequestMessage} from "../protocol";
import MessageType from "../MessageType";

export interface CloseRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  resourceId: string;
}

export class CloseRealTimeModelRequestSerializer {
  static serialize(request: CloseRealTimeModelRequest): any {
    return {
      t: MessageType.CLOSES_REAL_TIME_MODEL_REQUEST,
      r: request.resourceId
    };
  }
}
