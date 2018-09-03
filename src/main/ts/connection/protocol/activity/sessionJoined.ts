import {MessageBodyDeserializer} from "../MessageSerializer";
import {IncomingActivityMessage} from "./incomingActivityMessage";

/**
 * @hidden
 * @internal
 */
export interface ActivitySessionJoined extends IncomingActivityMessage {
  sessionId: string;
  state: Map<string, any>;
}

/**
 * @hidden
 * @internal
 */
export const ActivitySessionJoinedDeserializer: MessageBodyDeserializer<ActivitySessionJoined> = (body: any) => {
  const state: Map<string, any> = new Map<string, any>();
  for (const k of Object.keys(body.v)) {
    state.set(k, body.v[k]);
  }
  const result: ActivitySessionJoined = {
    activityId: body.i,
    sessionId: body.s,
    state
  };
  return result;
};
