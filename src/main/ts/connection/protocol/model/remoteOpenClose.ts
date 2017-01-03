import {IncomingProtocolResponseMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface RemoteClientOpenedModel extends IncomingProtocolResponseMessage {
  resourceId: string;
  username: string;
  sessionId: string;
}

export const RemoteClientOpenedModelDeserializer: MessageBodyDeserializer<RemoteClientOpenedModel> = (body: any) => {
  return {
    resourceId: body.r,
    username: body.u,
    sessionId: body.s
  };
};

export interface RemoteClientClosedModel extends IncomingProtocolResponseMessage {
  resourceId: string;
  username: string;
  sessionId: string;
}

export const RemoteClientClosedModelDeserializer: MessageBodyDeserializer<RemoteClientClosedModel> = (body: any) => {
  return {
    resourceId: body.r,
    username: body.u,
    sessionId: body.s
  };
};
