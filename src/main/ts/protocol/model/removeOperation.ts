import MessageType from "../MessageType";
import {IncomingProtocolNormalMessage} from "../protocol";
import Operation from "../../ot/ops/Operation";
import {OperationDeserializer} from "./operationData";

export interface RemoteOperation extends IncomingProtocolNormalMessage {
  resourceId: string;
  userId: string;
  clientId: string;
  version: number;
  timestamp: number;
  operation: Operation;
}

export class RemoteOperationDeserializer {
  static deserialize(body: any): RemoteOperation {
    return {
      resourceId: body.rId,
      userId: body.uId,
      clientId: body.sId,
      version: body.v,
      timestamp: body.t,
      operation: OperationDeserializer.deserialize(body.op),
      type: MessageType.REMOTE_OPERATION
    };
  }
}
