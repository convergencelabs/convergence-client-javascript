import {OutgoingProtocolRequestMessage} from "../protocol";
import {RemoteSession} from "../../../RemoteSession";

export interface OpenActivityRequest extends OutgoingProtocolRequestMessage {
  activityId: string;
}

export interface OpenActivityResponse extends OutgoingProtocolRequestMessage {
  joinedSession: {[key: string]: RemoteSession[]};
  state: ActivityState;
}

export type ActivityState = {[key: string]: {[key: string]: any}};
