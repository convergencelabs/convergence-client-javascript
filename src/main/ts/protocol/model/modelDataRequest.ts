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
      type: MessageType.MODEL_DATA_REQUEST,
      modelFqn: new ModelFqn(body.cd, body.m)
    };
  }
}

export interface ModelDataResponse extends OutgoingProtocolResponseMessage {
  data: any;
}

export class ModelDataResponseSerializer {
  static serialize(response: ModelDataResponse): any {
    return {
      t: MessageType.MODEL_DATA_RESPONSE,
      d: response.data
    };
  }
}
