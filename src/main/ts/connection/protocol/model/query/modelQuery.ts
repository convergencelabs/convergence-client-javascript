import {IncomingProtocolResponseMessage} from "../../protocol";
import {OutgoingProtocolRequestMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {ModelResult} from "../../../../model/query/ModelResult";

export interface ModelsQueryRequest extends OutgoingProtocolRequestMessage {
  query: string;
}

export const ModelsQueryRequestSerializer: MessageBodySerializer = (request: ModelsQueryRequest) => {
  const query: any = {
    q: request.query
  };

  return query;
};

export const ModelResultDeserializer: MessageBodyDeserializer<ModelResult> = (body: any) => {
  return {
    collectionId: body.l,
    modelId: body.m,
    created: body.c,
    modified: body.d,
    version: body.v,
    data: body.a
  };
};

export interface ModelsQueryResponse extends IncomingProtocolResponseMessage {
  result: ModelResult[];
}

export const ModelsQueryResponseDeserializer: MessageBodyDeserializer<ModelsQueryResponse> = (body: any) => {
  let modelResults: ModelResult[] = [];
  for (let r of body.r) {
    modelResults.push(ModelResultDeserializer(r));
  }

  return {
    result: modelResults
  };
};
