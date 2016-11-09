import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../protocol";
import {ActivityParticipant} from "../../../activity/ActivityParticipant";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {SessionIdParser} from "../SessionIdParser";

export interface ActivityJoinRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
  state: Map<string, any>;
}

export var ActivityJoinRequestSerializer: MessageBodySerializer = (request: ActivityJoinRequest) => {
  return {
    i: request.activityId,
    s: request.state
  };
};

export interface ActivityJoinResponse extends IncomingProtocolResponseMessage {
  participants: ActivityParticipant[];
}

export var ActivityJoinResponseDeserializer: MessageBodyDeserializer<ActivityJoinResponse> = (body: any) => {
  const participants: ActivityParticipant[] = [];

  for (let sessionId of Object.keys(body.s)) {
    let state: any = body.s[sessionId];
    let stateMap: Map<string, any> = new Map<string, any>();
    for (let key of Object.keys(state)) {
      stateMap.set(key, state[key]);
    }
    participants.push(new ActivityParticipant(SessionIdParser.parseUsername(sessionId), sessionId, stateMap));
  }

  const result: ActivityJoinResponse = {participants};
  return result;
};
