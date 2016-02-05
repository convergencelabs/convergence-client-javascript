import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../model/ModelFqn";


export interface CreateRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
  data: any;
}

export class CreateRealTimeModelRequestSerializer {
  static serialize(request: CreateRealTimeModelRequest): any {
    return {
      fqn: {
        cId: request.modelFqn.collectionId,
        mId: request.modelFqn.modelId
      },
      data: request.data
    };
  }
}
