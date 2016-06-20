import {IncomingProtocolResponseMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";


export interface RemoteClientOpenedModel extends IncomingProtocolResponseMessage {
  resourceId: string;
  userId: string;
  sessionId: string;
}

export var RemoteClientOpenedModelDeserializer: MessageBodyDeserializer<RemoteClientOpenedModel> = (body: any) => {
  return {
    resourceId: body.r,
    userId: body.u,
    sessionId: body.s
  };
};

export interface RemoteClientClosedModel extends IncomingProtocolResponseMessage {
  resourceId: string;
  userId: string;
  sessionId: string;
}

export var RemoteClientClosedModelDeserializer: MessageBodyDeserializer<RemoteClientClosedModel> = (body: any) => {
  return {
    resourceId: body.r,
    userId: body.u,
    sessionId: body.s
  };
};
