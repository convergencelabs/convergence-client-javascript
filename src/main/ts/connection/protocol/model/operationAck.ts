import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface OperationAck extends IncomingProtocolNormalMessage {
  resourceId: string;
  seqNo: number;
  version: number;
}

export var OperationAckDesrializer: MessageBodyDeserializer = (body: any) => {
  return {
    resourceId: body.r,
    seqNo: body.s,
    version: body.v
  };
};
