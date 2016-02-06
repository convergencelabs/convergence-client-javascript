import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../model/ModelFqn";


export interface DeleteRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

export class DeleteRealTimeModelRequestSerializer {
  static serialize(request: DeleteRealTimeModelRequest): any {
    return {
      fqn: {
        cId: request.modelFqn.collectionId,
        mId: request.modelFqn.modelId
      }
    };
  }
}
