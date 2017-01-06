import { OutgoingProtocolNormalMessage } from "../protocol";
import { MessageBodySerializer } from "../MessageSerializer";
import { MessageBodyDeserializer } from "../MessageSerializer";
import {IncomingActivityMessage} from "./incomingActivityMessage";

export interface ActivitySetState extends OutgoingProtocolNormalMessage {
  activityId: string;
  state: {[key: string]: any};
}

export const ActivitySetStateSerializer: MessageBodySerializer = (request: ActivitySetState) => {
  return {
    i: request.activityId,
    v: request.state
  };
};

export interface ActivityRemoveState extends OutgoingProtocolNormalMessage {
  activityId: string;
  keys: string[];
}

export const ActivityRemoveStateSerializer: MessageBodySerializer = (request: ActivityRemoveState) => {
  return {
    i: request.activityId,
    k: request.keys
  };
};

export interface ActivityClearState extends OutgoingProtocolNormalMessage {
  activityId: string;
}

export const ActivityClearStateSerializer: MessageBodySerializer = (request: ActivityClearState) => {
  return {
    i: request.activityId,
  };
};

export interface ActivityRemoteStateSet extends IncomingActivityMessage {
  sessionId: string;
  state: {[key: string]: any};
}

export const ActivityRemoteStateSetDeserializer: MessageBodyDeserializer<ActivityRemoteStateSet> = (body: any) => {
  const result: ActivityRemoteStateSet = {
    activityId: body.i,
    sessionId: body.s,
    state: body.v
  };
  return result;
};

export interface ActivityRemoteStateRemoved extends IncomingActivityMessage {
  sessionId: string;
  keys: string[];
}

export const ActivityRemoteStateRemovedDeserializer: MessageBodyDeserializer<ActivityRemoteStateRemoved> =
  (body: any) => {
    const result: ActivityRemoteStateRemoved = {
      activityId: body.i,
      sessionId: body.s,
      keys: body.k
    };
    return result;
  };

export interface ActivityRemoteStateCleared extends IncomingActivityMessage {
  sessionId: string;
}

export const ActivityRemoteStateClearedDeserializer: MessageBodyDeserializer<ActivityRemoteStateCleared> =
  (body: any) => {
    const result: ActivityRemoteStateCleared = {
      activityId: body.i,
      sessionId: body.s,
    };
    return result;
  };
