import {IncomingProtocolNormalMessage} from "../protocol";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface ActivitySessionLeft extends IncomingProtocolNormalMessage {
  sessionId: string;
}

export var ActivitySessionLeftDeserializer: MessageBodyDeserializer<ActivitySessionLeft> = (body: any) => {
  var result: ActivitySessionLeft = {
    sessionId: body.s
  };
  return result;
};
