import MessageType from "../MessageType";
import {OutgoingProtocolNormalMessage} from "../protocol";
import Operation from "../../ot/ops/Operation";
import {OperationSerializer} from "./operationData";


export interface OperationSubmission extends OutgoingProtocolNormalMessage {
  resourceId: string;
  seqNo: number;
  version: number;
  operation: Operation;
}

export class OperationSubmissionSerializer {
  static serialize(submission: OperationSubmission): any {
    return {
      rId: submission.resourceId,
      seq: submission.seqNo,
      v: submission.version,
      op: OperationSerializer.serialize(submission.operation),
      type: MessageType.OPERATION_SUBMISSION
    };
  }
}
