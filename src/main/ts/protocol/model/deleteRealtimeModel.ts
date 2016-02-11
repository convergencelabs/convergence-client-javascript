import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../model/ModelFqn";
import MessageType from "../MessageType";


export interface DeleteRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

export class DeleteRealTimeModelRequestSerializer {
  static serialize(request: DeleteRealTimeModelRequest): any {
    return {
      t: MessageType.DELETE_REAL_TIME_MODEL_REQUEST,
      c: request.modelFqn.collectionId,
      m: request.modelFqn.modelId
    };
  }
}
