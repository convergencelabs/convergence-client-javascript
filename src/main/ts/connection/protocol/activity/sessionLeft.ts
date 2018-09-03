import {MessageBodyDeserializer} from "../MessageSerializer";
import {IncomingActivityMessage} from "./incomingActivityMessage";

/**
 * @hidden
 * @internal
 */
export interface ActivitySessionLeft extends IncomingActivityMessage {
  sessionId: string;
}

/**
 * @hidden
 * @internal
 */
export const ActivitySessionLeftDeserializer: MessageBodyDeserializer<ActivitySessionLeft> = (body: any) => {
  const result: ActivitySessionLeft = {
    activityId: body.i,
    sessionId: body.s
  };
  return result;
};
