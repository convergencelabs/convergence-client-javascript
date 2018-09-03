import {IncomingProtocolResponseMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface RemoteClientOpenedModel extends IncomingProtocolResponseMessage {
  resourceId: string;
  username: string;
  sessionId: string;
}

/**
 * @hidden
 * @internal
 */
export const RemoteClientOpenedModelDeserializer: MessageBodyDeserializer<RemoteClientOpenedModel> = (body: any) => {
  return {
    resourceId: body.r,
    username: body.u,
    sessionId: body.s
  };
};

/**
 * @hidden
 * @internal
 */
export interface RemoteClientClosedModel extends IncomingProtocolResponseMessage {
  resourceId: string;
  username: string;
  sessionId: string;
}

/**
 * @hidden
 * @internal
 */
export const RemoteClientClosedModelDeserializer: MessageBodyDeserializer<RemoteClientClosedModel> = (body: any) => {
  return {
    resourceId: body.r,
    username: body.u,
    sessionId: body.s
  };
};
