import {IncomingProtocolNormalMessage} from "../protocol";
import {OutgoingProtocolNormalMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";


export interface ActivitySetState extends OutgoingProtocolNormalMessage {
  activityId: string;
  state: Map<string, any>;
}

export var ActivitySetStateSerializer: MessageBodySerializer = (request: ActivitySetState) => {
  return {
    i: request.activityId,
    v: request.state
  };
};

export interface ActivityClearState extends OutgoingProtocolNormalMessage {
  activityId: string;
  keys: string[];
}

export var ActivityClearStateSerializer: MessageBodySerializer = (request: ActivityClearState) => {
  return {
    i: request.activityId,
    k: request.keys
  };
};

export interface ActivityRemoteStateSet extends IncomingProtocolNormalMessage {
  activityId: string;
  sessionId: string;
  state: Map<string, any>;
}

export var ActivityRemoteStateSetDeserializer: MessageBodyDeserializer<ActivityRemoteStateSet> = (body: any) => {
  var result: ActivityRemoteStateSet = {
    activityId: body.i,
    sessionId: body.s,
    state: body.v
  };
  return result;
};

export interface ActivityRemoteStateCleared extends IncomingProtocolNormalMessage {
  activityId: string;
  sessionId: string;
  keys: string[];
}

export var ActivityRemoteStateClearedDeserializer: MessageBodyDeserializer<ActivityRemoteStateCleared> = (body: any) => {
  var result: ActivityRemoteStateCleared = {
    activityId: body.i,
    sessionId: body.s,
    keys: body.k
  };
  return result;
};
