import {IncomingProtocolResponseMessage} from "../../protocol";
import {OutgoingProtocolRequestMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {ModelResult} from "../../../../model/query/ModelResult";

export interface ModelQueryRequest extends OutgoingProtocolRequestMessage {
  collection?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
}

export var ModelQueryRequestSerializer: MessageBodySerializer = (request: ModelQueryRequest) => {
  return {
    c: request.collection,
    l: request.limit,
    f: request.offset,
    o: request.orderBy,
    a: request.ascending
  };
};

export var ModelResultDeserializer: MessageBodyDeserializer<ModelResult> = (body: any) => {
  return {
    collectionId: body.l,
    modelId: body.m,
    created: body.c,
    modified: body.d,
    version: body.v
  };
};

export interface ModelQueryResponse extends IncomingProtocolResponseMessage {
  result: ModelResult[];
}

export var ModelQueryResponseDeserializer: MessageBodyDeserializer<ModelQueryResponse> = (body: any) => {
  let modelResults: ModelResult[] = [];
  for (var r of body.r) {
    modelResults.push(ModelResultDeserializer(r));
  }

  return {
    result: modelResults
  };
};
