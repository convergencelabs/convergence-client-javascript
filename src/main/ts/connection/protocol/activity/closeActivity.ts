import {OutgoingProtocolRequestMessage} from "../protocol";

export interface CloseActivity extends OutgoingProtocolRequestMessage {
  activityId: string;
}
