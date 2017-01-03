import {IncomingProtocolResponseMessage} from "../../protocol";
import {OutgoingProtocolRequestMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {ModelResult} from "../../../../model/query/ModelResult";
import {OrderBy} from "../../../../util/OrderBy";

export interface ModelsQueryRequest extends OutgoingProtocolRequestMessage {
  collection?: string;
  limit?: number;
  offset?: number;
  orderBy?: OrderBy;
}

export const ModelsQueryRequestSerializer: MessageBodySerializer = (request: ModelsQueryRequest) => {
  const query: any = {
    c: request.collection,
    l: request.limit,
    f: request.offset,
  };

  if (request.orderBy) {
    query.o = {
      f: request.orderBy.field,
      a: request.orderBy.ascending
    };
  }

  return query;
};

export const ModelResultDeserializer: MessageBodyDeserializer<ModelResult> = (body: any) => {
  return {
    collectionId: body.l,
    modelId: body.m,
    created: body.c,
    modified: body.d,
    version: body.v
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
