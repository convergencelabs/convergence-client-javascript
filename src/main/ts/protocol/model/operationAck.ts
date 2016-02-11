import MessageType from "../MessageType";
import {IncomingProtocolNormalMessage} from "../protocol";

export interface OperationAck extends IncomingProtocolNormalMessage {
  resourceId: string;
  seqNo: number;
  version: number;
}

export class OperationAckDeserializer {
  static deserialize(body: any): OperationAck {
    return {
      type: MessageType.OPERATION_ACKNOWLEDGEMENT,
      resourceId: body.r,
      seqNo: body.s,
      version: body.v
    };
  }
}
