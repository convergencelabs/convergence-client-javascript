import { OutgoingProtocolNormalMessage } from "../protocol";
import { MessageBodySerializer, MessageBodyDeserializer } from "../MessageSerializer";
import {IncomingActivityMessage} from "./incomingActivityMessage";

/**
 * @hidden
 * @internal
 */
export interface ActivitySetState extends OutgoingProtocolNormalMessage {
  activityId: string;
  state: {[key: string]: any};
}

/**
 * @hidden
 * @internal
 */
export const ActivitySetStateSerializer: MessageBodySerializer = (request: ActivitySetState) => {
  return {
    i: request.activityId,
    v: request.state
  };
};

/**
 * @hidden
 * @internal
 */
export interface ActivityRemoveState extends OutgoingProtocolNormalMessage {
  activityId: string;
  keys: string[];
}

/**
 * @hidden
 * @internal
 */
export const ActivityRemoveStateSerializer: MessageBodySerializer = (request: ActivityRemoveState) => {
  return {
    i: request.activityId,
    k: request.keys
  };
};

/**
 * @hidden
 * @internal
 */
export interface ActivityClearState extends OutgoingProtocolNormalMessage {
  activityId: string;
}

/**
 * @hidden
 * @internal
 */
export const ActivityClearStateSerializer: MessageBodySerializer = (request: ActivityClearState) => {
  return {
    i: request.activityId,
  };
};

/**
 * @hidden
 * @internal
 */
export interface ActivityRemoteStateSet extends IncomingActivityMessage {
  sessionId: string;
  state: {[key: string]: any};
}

/**
 * @hidden
 * @internal
 */
export const ActivityRemoteStateSetDeserializer: MessageBodyDeserializer<ActivityRemoteStateSet> = (body: any) => {
  const result: ActivityRemoteStateSet = {
    activityId: body.i,
    sessionId: body.s,
    state: body.v
  };
  return result;
};

/**
 * @hidden
 * @internal
 */
export interface ActivityRemoteStateRemoved extends IncomingActivityMessage {
  sessionId: string;
  keys: string[];
}

/**
 * @hidden
 * @internal
 */
export const ActivityRemoteStateRemovedDeserializer: MessageBodyDeserializer<ActivityRemoteStateRemoved> =
  (body: any) => {
    const result: ActivityRemoteStateRemoved = {
      activityId: body.i,
      sessionId: body.s,
      keys: body.k
    };
    return result;
  };

/**
 * @hidden
 * @internal
 */
export interface ActivityRemoteStateCleared extends IncomingActivityMessage {
  sessionId: string;
}

/**
 * @hidden
 * @internal
 */
export const ActivityRemoteStateClearedDeserializer: MessageBodyDeserializer<ActivityRemoteStateCleared> =
  (body: any) => {
    const result: ActivityRemoteStateCleared = {
      activityId: body.i,
      sessionId: body.s,
    };
    return result;
  };
