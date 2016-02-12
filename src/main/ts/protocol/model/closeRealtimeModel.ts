import {OutgoingProtocolRequestMessage} from "../protocol";
import MessageType from "../MessageType";
import {MessageSerializer} from "../MessageSerializer";

export interface CloseRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  resourceId: string;
}

MessageSerializer.registerMessageBodySerializer(MessageType.CLOSES_REAL_TIME_MODEL_REQUEST, (request: CloseRealTimeModelRequest) => {
  return {
    r: request.resourceId
  };
});
