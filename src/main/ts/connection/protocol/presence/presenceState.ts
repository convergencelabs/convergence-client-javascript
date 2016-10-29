import {IncomingProtocolNormalMessage} from "../protocol";
import {OutgoingProtocolNormalMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";


export interface PresenceSetState extends OutgoingProtocolNormalMessage {
  state: {[key: string]: any};
  all: boolean;
}

export var PresenceSetStateSerializer: MessageBodySerializer = (request: PresenceSetState) => {
  return {
    s: request.state,
    a: request.all
  };
};

export interface PresenceRemoveState extends OutgoingProtocolNormalMessage {
  keys: string[];
}

export var PresenceRemoveStateSerializer: MessageBodySerializer = (request: PresenceRemoveState) => {
  return {
    k: request.keys
  };
};

export interface PresenceClearState extends OutgoingProtocolNormalMessage {
}


export interface PresenceStateSet extends IncomingProtocolNormalMessage {
  username: string;
  state: Map<string, any>;
}

export var PresenceStateSetDeserializer: MessageBodyDeserializer<PresenceStateSet> = (body: any) => {
  var result: PresenceStateSet = {
    username: body.u,
    state: body.s
  };
  return result;
};

export interface PresenceStateRemoved extends IncomingProtocolNormalMessage {
  username: string;
  keys: string[];
}

export var PresenceStateRemovedDeserializer: MessageBodyDeserializer<PresenceStateRemoved> = (body: any) => {
  var result: PresenceStateRemoved = {
    username: body.u,
    keys: body.k
  };
  return result;
};

export interface PresenceStateCleared extends IncomingProtocolNormalMessage {
  username: string;
}

export var PresenceStateClearedDeserializer: MessageBodyDeserializer<PresenceStateCleared> = (body: any) => {
  var result: PresenceStateCleared = {
    username: body.u
  };
  return result;
};
