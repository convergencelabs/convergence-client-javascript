import {IncomingProtocolResponseMessage} from "../../protocol";
import {OutgoingProtocolRequestMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {ModelResult} from "../../../../model/query/ModelResult";

/**
 * @hidden
 * @internal
 */
export interface ModelsQueryRequest extends OutgoingProtocolRequestMessage {
  query: string;
}

/**
 * @hidden
 * @internal
 */
export const ModelsQueryRequestSerializer: MessageBodySerializer = (request: ModelsQueryRequest) => {
  const query: any = {
    q: request.query
  };

  return query;
};

/**
 * @hidden
 * @internal
 */
export const ModelResultDeserializer: MessageBodyDeserializer<ModelResult> = (body: any) => {
  return new ModelResult(
    body.a,
    body.l,
    body.m,
    new Date(body.c),
    new Date(body.d),
    body.v,
  );
};

/**
 * @hidden
 * @internal
 */
export interface ModelsQueryResponse extends IncomingProtocolResponseMessage {
  result: ModelResult[];
}

/**
 * @hidden
 * @internal
 */
export const ModelsQueryResponseDeserializer: MessageBodyDeserializer<ModelsQueryResponse> = (body: any) => {
  const modelResults: ModelResult[] = [];
  for (const r of body.r) {
    modelResults.push(ModelResultDeserializer(r));
  }

  return {
    result: modelResults
  };
};
