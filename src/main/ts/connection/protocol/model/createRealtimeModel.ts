import {OutgoingProtocolRequestMessage, IncomingProtocolResponseMessage} from "../protocol";
import {MessageBodySerializer, MessageBodyDeserializer} from "../MessageSerializer";
import {ObjectValue} from "../../../model/dataValue";
import {DataValueSerializer} from "./dataValue";
import {ModelPermissions} from "../../../model/ModelPermissions";
import {serializeModelPermissions} from "./permissions/modelPermissions";

export interface CreateRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  collectionId: string;
  modelId?: string;
  data?: ObjectValue;
  overrideWorld?: boolean;
  worldPermissions?: ModelPermissions;
  userPermissions?: {[key: string]: ModelPermissions};
}

export const CreateRealTimeModelRequestSerializer: MessageBodySerializer = (request: CreateRealTimeModelRequest) => {
  const d: any = request.data ? DataValueSerializer(request.data) : undefined;
  const w = serializeModelPermissions(request.worldPermissions);
  const v = request.overrideWorld;
  let u: {[key: string]: any};
  if (request.userPermissions) {
    u = {};
    Object.keys(request.userPermissions).forEach(username => {
      u[username] = serializeModelPermissions(request.userPermissions[username]);
    });
  }

  return {
    c: request.collectionId,
    m: request.modelId,
    d,
    v,
    w,
    u
  };
};

export interface CreateRealTimeModelResponse extends IncomingProtocolResponseMessage {
  collectionId: string;
  modelId: string;
}

export const CreateRealTimeModelResponseDeserializer: MessageBodyDeserializer<CreateRealTimeModelResponse> =
  (body: any) => {
    return {
      collectionId: body.c,
      modelId: body.m
    };
  };
