import MessageType from "../MessageType";
import {IncomingProtocolNormalMessage} from "../protocol";
import Operation from "../../ot/ops/Operation";
import {OperationDeserializer} from "./operationData";
import {MessageSerializer} from "../MessageSerializer";

export interface RemoteOperation extends IncomingProtocolNormalMessage {
  resourceId: string;
  userId: string;
  clientId: string;
  version: number;
  timestamp: number;
  operation: Operation;
}

MessageSerializer.registerMessageBodyDeserializer(MessageType.REMOTE_OPERATION, (body: any) => {
  return {
    resourceId: body.rId,
    userId: body.uId,
    clientId: body.sId,
    version: body.v,
    timestamp: body.t,
    operation: OperationDeserializer.deserialize(body.op)
  };
});
