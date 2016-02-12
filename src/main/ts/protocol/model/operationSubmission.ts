import {OutgoingProtocolNormalMessage} from "../protocol";
import Operation from "../../ot/ops/Operation";
import {OperationSerializer} from "./operationData";
import MessageType from "../MessageType";
import {MessageSerializer} from "../MessageSerializer";

export interface OperationSubmission extends OutgoingProtocolNormalMessage {
  resourceId: string;
  seqNo: number;
  version: number;
  operation: Operation;
}

MessageSerializer.registerMessageBodySerializer(MessageType.OPERATION_SUBMISSION, (submission: OperationSubmission) => {
  return {
    r: submission.resourceId,
    s: submission.seqNo,
    v: submission.version,
    o: OperationSerializer.serialize(submission.operation)
  };
});
