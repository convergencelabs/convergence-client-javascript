import {IncomingProtocolNormalMessage} from "../protocol";
import {OutgoingProtocolNormalMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface PresenceSetState extends OutgoingProtocolNormalMessage {
  state: {[key: string]: any};
  all: boolean;
}

/**
 * @hidden
 * @internal
 */
export const PresenceSetStateSerializer: MessageBodySerializer = (request: PresenceSetState) => {
  return {
    s: request.state,
    a: request.all
  };
};

/**
 * @hidden
 * @internal
 */
export interface PresenceRemoveState extends OutgoingProtocolNormalMessage {
  keys: string[];
}

/**
 * @hidden
 * @internal
 */
export const PresenceRemoveStateSerializer: MessageBodySerializer = (request: PresenceRemoveState) => {
  return {
    k: request.keys
  };
};

/**
 * @hidden
 * @internal
 */
export interface PresenceClearState extends OutgoingProtocolNormalMessage {
}

/**
 * @hidden
 * @internal
 */
export interface PresenceStateSet extends IncomingProtocolNormalMessage {
  username: string;
  state: Map<string, any>;
}

/**
 * @hidden
 * @internal
 */
export const PresenceStateSetDeserializer: MessageBodyDeserializer<PresenceStateSet> = (body: any) => {
  const result: PresenceStateSet = {
    username: body.u,
    state: body.s
  };
  return result;
};

/**
 * @hidden
 * @internal
 */
export interface PresenceStateRemoved extends IncomingProtocolNormalMessage {
  username: string;
  keys: string[];
}

/**
 * @hidden
 * @internal
 */
export const PresenceStateRemovedDeserializer: MessageBodyDeserializer<PresenceStateRemoved> = (body: any) => {
  const result: PresenceStateRemoved = {
    username: body.u,
    keys: body.k
  };
  return result;
};

/**
 * @hidden
 * @internal
 */
export interface PresenceStateCleared extends IncomingProtocolNormalMessage {
  username: string;
}

/**
 * @hidden
 * @internal
 */
export const PresenceStateClearedDeserializer: MessageBodyDeserializer<PresenceStateCleared> = (body: any) => {
  const result: PresenceStateCleared = {
    username: body.u
  };
  return result;
};
