import {OutgoingProtocolNormalMessage} from "../protocol";
import {Operation} from "../../../model/ot/ops/Operation";
import {OperationSerializer} from "./operationData";
import {MessageBodySerializer} from "../MessageSerializer";

export interface OperationSubmission extends OutgoingProtocolNormalMessage {
  resourceId: string;
  seqNo: number;
  version: number;
  operation: Operation;
}

export var OperationSubmissionSerializer: MessageBodySerializer =  (submission: OperationSubmission) => {
  return {
    r: submission.resourceId,
    s: submission.seqNo,
    v: submission.version,
    o: OperationSerializer.serialize(submission.operation)
  };
};
