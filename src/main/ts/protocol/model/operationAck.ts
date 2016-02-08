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
      resourceId: body.rId,
      seqNo: body.seq,
      version: body.v,
      type: MessageType.OPERATION_ACK
    };
  }
}
