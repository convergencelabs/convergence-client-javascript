import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../protocol";
import {ActivityParticipant} from "../../../activity/ActivityParticipant";
import {MessageBodyDeserializer} from "../MessageSerializer";

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
  var participants: ActivityParticipant[] = [];

  for (var participant of body.s) {
    let state: Map<string, any> = new Map<string, any>();
    for (let k of Object.keys(participant.state)) {
      state.set(k, participant.state[k]);
    }
    participants.push(new ActivityParticipant(participant.username, participant.session, state));
  }

  var result: ActivityJoinResponse = {
    participants: participants
  };
  return result;
};
