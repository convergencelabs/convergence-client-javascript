import {IncomingProtocolResponseMessage} from "../../protocol";
import {OutgoingProtocolRequestMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {MessageBodyDeserializer} from "../../MessageSerializer";

export interface ModelQueryRequest extends OutgoingProtocolRequestMessage {
  collection?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
}

export var ModelQueryRequestSerializer: MessageBodySerializer = (request: ModelQueryRequest) => {
  return {

  };
};

export interface ModelQueryResponse extends IncomingProtocolResponseMessage {

}

export var ModelQueryResponseDeserializer: MessageBodyDeserializer<ModelQueryResponse> = (body: any) => {
  return {

  };
};
