import {IncomingProtocolNormalMessage} from "../protocol";
import {Operation} from "../../../model/ot/ops/Operation";
import {OperationDeserializer} from "./operationData";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface RemoteOperation extends IncomingProtocolNormalMessage {
  resourceId: string;
  sessionId: string;
  version: number;
  timestamp: number;
  operation: Operation;
}

export const RemoteOperationDeserializer: MessageBodyDeserializer<RemoteOperation> =  (body: any) => {
  return {
    resourceId: body.r,
    sessionId: body.s,
    version: body.v,
    timestamp: body.p,
    operation: OperationDeserializer.deserialize(body.o)
  };
};
