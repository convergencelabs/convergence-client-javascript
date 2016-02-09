import {OutgoingProtocolRequestMessage} from "../protocol";

export interface CloseRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  resourceId: string;
}

export class CloseRealTimeModelRequestSerializer {
  static serialize(request: CloseRealTimeModelRequest): any {
    return {
      rId: request.resourceId
    };
  }
}
