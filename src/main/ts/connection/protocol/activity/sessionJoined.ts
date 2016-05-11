import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface ActivitySessionJoined extends IncomingProtocolNormalMessage {
  activityId: string;
  sessionId: string;
}

export var ActivitySessionJoinedDeserializer: MessageBodyDeserializer<ActivitySessionJoined> = (body: any) => {
  var result: ActivitySessionJoined = {
    activityId: body.i,
    sessionId: body.s
  };
  return result;
};
