import {IncomingProtocolResponseMessage} from "../protocol";
import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../model/ModelFqn";
import MessageType from "../MessageType";


export interface OpenRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
  initializerProvided: boolean;
}

export class OpenRealTimeModelRequestSerializer {
  static serialize(request: OpenRealTimeModelRequest): any {
    return {
      t: MessageType.OPEN_REAL_TIME_MODEL_REQUEST,
      c: request.modelFqn.collectionId,
      m: request.modelFqn.modelId,
      i: request.initializerProvided
    };
  }
}

export interface OpenRealTimeModelResponse extends IncomingProtocolResponseMessage {
  resourceId: string;
  version: number;
  createdTime: number;
  modifiedTime: number;
  data: any;
}

export class OpenRealTimeModelResponseMessageDeserializer {
  static deserialize(body: any): OpenRealTimeModelResponse {
    return {
      type: MessageType.OPEN_REAL_TIME_MODEL_RESPONSE,
      resourceId: body.r,
      version: body.v,
      createdTime: body.c,
      modifiedTime: body.m,
      data: body.d
    };
  }
}
