import {IncomingProtocolNormalMessage} from "../protocol";
import {OutgoingProtocolNormalMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";


export interface PresenceSetState extends OutgoingProtocolNormalMessage {
  key: string;
  value: any;
}

export var PresenceSetStateSerializer: MessageBodySerializer = (request: PresenceSetState) => {
  return {
    k: request.key,
    v: request.value
  };
};

export interface PresenceClearState extends OutgoingProtocolNormalMessage {
  key: string;
}

export var PresenceClearStateSerializer: MessageBodySerializer = (request: PresenceClearState) => {
  return {
    k: request.key
  };
};

export interface PresenceStateSet extends IncomingProtocolNormalMessage {
  username: string;
  key: string;
  value: any;
}

export var PresenceStateSetDeserializer: MessageBodyDeserializer<PresenceStateSet> = (body: any) => {
  var result: PresenceStateSet = {
    username: body.u,
    key: body.k,
    value: body.v
  };
  return result;
};

export interface PresenceStateCleared extends IncomingProtocolNormalMessage {
  username: string;
  key: string;
}

export var PresenceStateClearedDeserializer: MessageBodyDeserializer<PresenceStateCleared> = (body: any) => {
  var result: PresenceStateCleared = {
    username: body.u,
    key: body.k
  };
  return result;
};
