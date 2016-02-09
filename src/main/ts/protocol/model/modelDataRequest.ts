import {IncomingProtocolRequestMessage} from "../protocol";
import {OutgoingProtocolResponseMessage} from "../protocol";
import ModelFqn from "../../model/ModelFqn";
import MessageType from "../MessageType";

export interface ModelDataRequest extends IncomingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

export class ModelDataRequestDeserializer {
  static deserialize(body: any): ModelDataRequest {
    return {
      modelFqn: new ModelFqn(body.fqn.cId, body.fqn.mId),
      type: MessageType.MODEL_DATA_REQUEST
    };
  }
}

export interface ModelDataResponse extends OutgoingProtocolResponseMessage {
  data: any;
}

export class ModelDataResponseSerializer {
  static serialize(response: ModelDataResponse): any {
    return {
      data: response.data
    };
  }
}
