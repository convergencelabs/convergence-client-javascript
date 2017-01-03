import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface ActivitySessionJoined extends IncomingProtocolNormalMessage {
  activityId: string;
  sessionId: string;
  state: Map<string, any>;
}

export const ActivitySessionJoinedDeserializer: MessageBodyDeserializer<ActivitySessionJoined> = (body: any) => {
  const state: Map<string, any> = new Map<string, any>();
  for (let k of Object.keys(body.v)) {
    state.set(k, body.v[k]);
  }
  const result: ActivitySessionJoined = {
    activityId: body.i,
    sessionId: body.s,
    state
  };
  return result;
};
