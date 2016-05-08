import {OutgoingProtocolRequestMessage} from "../protocol";

export interface JoinActivityRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

export interface JoinActivityResponse extends OutgoingProtocolRequestMessage {
}
