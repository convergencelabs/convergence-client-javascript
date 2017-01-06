import {MessageBodyDeserializer} from "../MessageSerializer";
import {IncomingActivityMessage} from "./incomingActivityMessage";

export interface ActivitySessionLeft extends IncomingActivityMessage {
  sessionId: string;
}

export const ActivitySessionLeftDeserializer: MessageBodyDeserializer<ActivitySessionLeft> = (body: any) => {
  const result: ActivitySessionLeft = {
    activityId: body.i,
    sessionId: body.s
  };
  return result;
};
