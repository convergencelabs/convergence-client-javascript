import {OutgoingProtocolRequestMessage} from "../protocol";

export interface LeaveActivityRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

export interface LeaveActivityResponse extends OutgoingProtocolRequestMessage {
}
