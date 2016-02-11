import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../model/ModelFqn";
import MessageType from "../MessageType";


export interface CreateRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
  data: any;
}

export class CreateRealTimeModelRequestSerializer {
  static serialize(request: CreateRealTimeModelRequest): any {
    return {
      t: MessageType.CREATE_REAL_TIME_MODEL_REQUEST,
      c: request.modelFqn.collectionId,
      m: request.modelFqn.modelId,
      d: request.data
    };
  }
}
