import {ModelFqn} from "../../../../model/ModelFqn";
import {OutgoingProtocolRequestMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../../protocol";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {ModelOperation} from "../../../../model/ot/applied/ModelOperation";
import {ModelOperationDeserializer} from "../appliedOperationData";

export interface HistoricalOperationsRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
  first: number;
  last: number;
}

export var HistoricalOperationsRequestSerializer: MessageBodySerializer = (request: HistoricalOperationsRequest) => {
  return {
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId,
    f: request.first,
    l: request.last
  };
};

export interface HistoricalOperationsResponse extends IncomingProtocolResponseMessage {
  operations: ModelOperation[];
}

export var HistoricalOperationsResponseDeserializer: MessageBodyDeserializer<HistoricalOperationsResponse> =
  (body: any) => {
    return {
      operations: (<any[]> body.o).map((op) => {
        return ModelOperationDeserializer.deserialize(op);
      })
    };
  };
