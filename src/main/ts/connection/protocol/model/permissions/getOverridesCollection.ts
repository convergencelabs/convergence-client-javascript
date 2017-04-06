import {OutgoingProtocolRequestMessage} from "../../protocol";
import {ModelFqn} from "../../../../model/ModelFqn";
import {MessageBodySerializer} from "../../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../../protocol";
import {MessageBodyDeserializer} from "../../MessageSerializer";

export interface GetOverridesCollectionRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

export const GetOverridesCollectionRequestSerializer: MessageBodySerializer =
  (request: GetOverridesCollectionRequest) => {
    return {
      c: request.modelFqn.collectionId,
      m: request.modelFqn.modelId
    };
  };

export interface GetOverridesCollectionResponse extends IncomingProtocolResponseMessage {
  overridesCollection: boolean;
}

export const GetOverridesCollectionResponseGDeserializer: MessageBodyDeserializer<GetOverridesCollectionResponse> =
  (body: any) => {
    const overridesCollection = body.o;
    return {overridesCollection};
  };
