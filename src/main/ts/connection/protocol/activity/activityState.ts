import {IncomingProtocolNormalMessage} from "../protocol";
import {OutgoingProtocolNormalMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";


export interface ActivitySetState extends OutgoingProtocolNormalMessage {
  key: string;
  value: any;
}

export var ActivitySetStateSerializer: MessageBodySerializer = (request: ActivitySetState) => {
  return {
    k: request.key,
    v: request.value
  };
};

export interface ActivityClearState extends OutgoingProtocolNormalMessage {
  key: string;
}

export var ActivityClearStateSerializer: MessageBodySerializer = (request: ActivityClearState) => {
  return {
    k: request.key
  };
};

export interface ActivityRemoteStateSet extends IncomingProtocolNormalMessage {
  sessionId: string;
  key: string;
  value: any;
}

export var ActivityRemoteStateSetDeserializer: MessageBodyDeserializer<ActivityRemoteStateSet> = (body: any) => {
  var result: ActivityRemoteStateSet = {
    sessionId: body.s,
    key: body.k,
    value: body.v
  };
  return result;
};

export interface ActivityRemoteStateCleared extends IncomingProtocolNormalMessage {
  sessionId: string;
  key: string;
}

export var ActivityRemoteStateClearedDeserializer: MessageBodyDeserializer<ActivityRemoteStateCleared> = (body: any) => {
  var result: ActivityRemoteStateCleared = {
    sessionId: body.s,
    key: body.k
  };
  return result;
};
