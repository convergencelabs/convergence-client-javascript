import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface ActivitySessionLeft extends IncomingProtocolNormalMessage {
  activityId: string;
  sessionId: string;
}

export var ActivitySessionLeftDeserializer: MessageBodyDeserializer<ActivitySessionLeft> = (body: any) => {
  const result: ActivitySessionLeft = {
    activityId: body.i,
    sessionId: body.s
  };
  return result;
};
