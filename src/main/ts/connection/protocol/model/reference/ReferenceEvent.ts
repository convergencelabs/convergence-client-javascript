import {Path} from "../../../../model/ot/Path";
import {IncomingProtocolNormalMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {ReferenceType} from "../../../../model/reference/ModelReference";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {CodeMap} from "../../../../util/CodeMap";

var ReferenceTypeCodes: CodeMap = new CodeMap();
ReferenceTypeCodes.put(0, ReferenceType.INDEX);
ReferenceTypeCodes.put(1, ReferenceType.RANGE);
ReferenceTypeCodes.put(2, ReferenceType.PROPERTY);
ReferenceTypeCodes.put(3, ReferenceType.PATH);

export interface IncomingReferenceMessage extends IncomingProtocolNormalMessage {
  sessionId: string;
  key: string;
  modelPath: Path;
}

export interface ReferenceCleared extends IncomingReferenceMessage {

}


export interface ReferenceRemoved extends IncomingReferenceMessage {
}

export var ReferenceMessageDeserializer: MessageBodyDeserializer<IncomingReferenceMessage> = (body: any) => {
  return {
    sessionId: body.s,
    key: body.k,
    modelPath: body.m
  };
};

export var ReferenceMessageSerializer: MessageBodySerializer = (message: IncomingReferenceMessage) => {
  return {
    s: message.sessionId,
    k: message.key,
    m: message.modelPath
  };
};


export interface IncomingReferenceValueMessage extends IncomingReferenceMessage {
  referenceType: string;
  value?: any;
}

export interface ReferenceCreated extends IncomingReferenceValueMessage {

}

export interface ReferenceSet extends IncomingReferenceValueMessage {

}

export var ReferenceValueDeserializer: MessageBodyDeserializer<IncomingReferenceValueMessage> = (body: any) => {
  return {
    sessionId: body.s,
    key: body.k,
    modelPath: body.m,
    referenceType: ReferenceTypeCodes.value(body.r),
    value: body.v
  };
};

export var ReferenceValueSerializer: MessageBodySerializer = (message: IncomingReferenceValueMessage) => {
  return {
    s: message.sessionId,
    k: message.key,
    m: message.modelPath,
    r: ReferenceTypeCodes.code(message.referenceType),
    v: message.value
  };
};
