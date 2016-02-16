import {IncomingProtocolNormalMessage} from "../protocol";
import Operation from "../../../model/ot/ops/Operation";
import {OperationDeserializer} from "./operationData";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface RemoteOperation extends IncomingProtocolNormalMessage {
  resourceId: string;
  userId: string;
  clientId: string;
  version: number;
  timestamp: number;
  operation: Operation;
}

export var RemoteOperationDesrializer: MessageBodyDeserializer =  (body: any) => {
  return {
    resourceId: body.r,
    userId: body.u,
    clientId: body.s,
    version: body.v,
    timestamp: body.p,
    operation: OperationDeserializer.deserialize(body.o)
  };
};
