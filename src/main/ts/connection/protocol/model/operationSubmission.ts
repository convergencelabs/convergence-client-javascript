import {OutgoingProtocolNormalMessage} from "../protocol";
import {Operation} from "../../../model/ot/ops/Operation";
import {OperationSerializer} from "./operationData";
import {MessageBodySerializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface OperationSubmission extends OutgoingProtocolNormalMessage {
  resourceId: string;
  seqNo: number;
  version: number;
  operation: Operation;
}

/**
 * @hidden
 * @internal
 */
export const OperationSubmissionSerializer: MessageBodySerializer =  (submission: OperationSubmission) => {
  return {
    r: submission.resourceId,
    s: submission.seqNo,
    v: submission.version,
    o: OperationSerializer.serialize(submission.operation)
  };
};
