import { IncomingProtocolNormalMessage } from "../protocol";
import { OutgoingProtocolNormalMessage } from "../protocol";
import { MessageBodySerializer } from "../MessageSerializer";
import { MessageBodyDeserializer } from "../MessageSerializer";

export interface ActivitySetState extends OutgoingProtocolNormalMessage {
  activityId: string;
  state: {[key: string]: any};
}

export var ActivitySetStateSerializer: MessageBodySerializer = (request: ActivitySetState) => {
  return {
    i: request.activityId,
    v: request.state
  };
};

export interface ActivityRemoveState extends OutgoingProtocolNormalMessage {
  activityId: string;
  keys: string[];
}

export var ActivityRemoveStateSerializer: MessageBodySerializer = (request: ActivityRemoveState) => {
  return {
    i: request.activityId,
    k: request.keys
  };
};

export interface ActivityClearState extends OutgoingProtocolNormalMessage {
  activityId: string;
}

export var ActivityClearStateSerializer: MessageBodySerializer = (request: ActivityClearState) => {
  return {
    i: request.activityId,
  };
};

export interface ActivityRemoteStateSet extends IncomingProtocolNormalMessage {
  activityId: string;
  sessionId: string;
  state: {[key: string]: any};
}

export var ActivityRemoteStateSetDeserializer: MessageBodyDeserializer<ActivityRemoteStateSet> = (body: any) => {
  const result: ActivityRemoteStateSet = {
    activityId: body.i,
    sessionId: body.s,
    state: body.v
  };
  return result;
};

export interface ActivityRemoteStateRemoved extends IncomingProtocolNormalMessage {
  activityId: string;
  sessionId: string;
  keys: string[];
}

export var ActivityRemoteStateRemovedDeserializer: MessageBodyDeserializer<ActivityRemoteStateRemoved> =
  (body: any) => {
    const result: ActivityRemoteStateRemoved = {
      activityId: body.i,
      sessionId: body.s,
      keys: body.k
    };
    return result;
  };

export interface ActivityRemoteStateCleared extends IncomingProtocolNormalMessage {
  activityId: string;
  sessionId: string;
}

export var ActivityRemoteStateClearedDeserializer: MessageBodyDeserializer<ActivityRemoteStateCleared> =
  (body: any) => {
    const result: ActivityRemoteStateCleared = {
      activityId: body.i,
      sessionId: body.s,
    };
    return result;
  };
