import MessageType from "../MessageType";
import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageSerializer} from "../MessageSerializer";

export interface OperationAck extends IncomingProtocolNormalMessage {
  resourceId: string;
  seqNo: number;
  version: number;
}

MessageSerializer.registerMessageBodyDeserializer(MessageType.OPERATION_ACKNOWLEDGEMENT, (body: any) => {
  return {
    resourceId: body.r,
    seqNo: body.s,
    version: body.v
  };
});
