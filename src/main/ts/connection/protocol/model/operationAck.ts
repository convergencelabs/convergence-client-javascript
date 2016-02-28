import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface OperationAck extends IncomingProtocolNormalMessage {
  resourceId: string;
  seqNo: number;
  version: number;
}

export var OperationAckDeserializer: MessageBodyDeserializer<OperationAck> = (body: any) => {
  return {
    resourceId: body.r,
    seqNo: body.s,
    version: body.v
  };
};
