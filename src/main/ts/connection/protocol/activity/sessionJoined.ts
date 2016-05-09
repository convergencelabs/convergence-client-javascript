import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface ActivitySessionJoined extends IncomingProtocolNormalMessage {
  sessionId: string;
}

export var ActivitySessionJoinedDeserializer: MessageBodyDeserializer<ActivitySessionJoined> = (body: any) => {
  var result: ActivitySessionJoined = {
    sessionId: body.s
  };
  return result;
};
