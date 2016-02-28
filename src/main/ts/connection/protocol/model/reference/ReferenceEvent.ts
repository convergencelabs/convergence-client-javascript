import {Path} from "../../../../model/ot/Path";
import {IncomingProtocolNormalMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {ReferenceType} from "../../../../model/reference/ModelReference";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {CodeMap} from "../../../../util/CodeMap";
import {OutgoingProtocolNormalMessage} from "../../protocol";

var ReferenceTypeCodes: CodeMap = new CodeMap();
ReferenceTypeCodes.put(0, ReferenceType.INDEX);
ReferenceTypeCodes.put(1, ReferenceType.RANGE);
ReferenceTypeCodes.put(2, ReferenceType.PROPERTY);
ReferenceTypeCodes.put(3, ReferenceType.PATH);


///////////////////////////////////////////////////////////////////////////////
// Incoming References
///////////////////////////////////////////////////////////////////////////////

export interface IncomingReferenceMessage extends IncomingProtocolNormalMessage {
  sessionId: string;
  resourceId: string;
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
    resourceId: body.r,
    key: body.k,
    modelPath: body.m
  };
};


export interface IncomingReferenceValueMessage extends IncomingReferenceMessage {
  value?: any;
}

export interface ReferenceCreated extends IncomingReferenceValueMessage {
  referenceType: string;
}

export interface ReferenceSet extends IncomingReferenceValueMessage {

}

export var ReferenceValueDeserializer: MessageBodyDeserializer<IncomingReferenceValueMessage> = (body: any) => {
  return {
    resourceId: body.r,
    sessionId: body.s,
    key: body.k,
    modelPath: body.m,
    referenceType: ReferenceTypeCodes.value(body.p),
    value: body.v
  };
};



///////////////////////////////////////////////////////////////////////////////
// Outgoing References
///////////////////////////////////////////////////////////////////////////////

export interface OutgoingReferenceMessage extends OutgoingProtocolNormalMessage {
  resourceId: string;
  modelPath: Path;
  key: string;
}

export var ReferenceMessageSerializer: MessageBodySerializer = (message: OutgoingReferenceMessage) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key
  };
};

export interface OutgoingReferenceValueMessage extends OutgoingReferenceMessage {
  value: any;
}

export interface SetReference extends OutgoingReferenceValueMessage {
}

export var SetReferenceSerializer: MessageBodySerializer = (message: SetReference) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key,
    v: message.value
  };
};

export interface CreateReference extends OutgoingReferenceValueMessage {
  referenceType: string;
}

export var CreateReferenceSerializer: MessageBodySerializer = (message: CreateReference) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key,
    v: message.value,
    p: ReferenceTypeCodes.code(message.referenceType)
  };
};


export var ReferenceValueSerializer: MessageBodySerializer = (message: IncomingReferenceValueMessage) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key,
    v: message.value
  };
};
