import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface OperationAck extends IncomingProtocolNormalMessage {
  resourceId: string;
  seqNo: number;
  version: number;
  timestamp: number;
}

/**
 * @hidden
 * @internal
 */
export const OperationAckDeserializer: MessageBodyDeserializer<OperationAck> = (body: any) => {
  return {
    resourceId: body.r,
    seqNo: body.s,
    version: body.v,
    timestamp: body.p
  };
};
