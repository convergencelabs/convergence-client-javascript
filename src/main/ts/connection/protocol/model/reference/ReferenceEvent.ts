import {Path} from "../../../../model/ot/Path";
import {MessageBodySerializer} from "../../MessageSerializer";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {CodeMap} from "../../../../util/CodeMap";
import {OutgoingProtocolNormalMessage} from "../../protocol";
import {IncomingProtocolNormalMessage} from "../../protocol";
import {ReferenceType} from "../../../../model/reference/ModelReference";

///////////////////////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////////////////////

var ReferenceTypeCodes: CodeMap = new CodeMap();
ReferenceTypeCodes.put(0, ReferenceType.INDEX);
ReferenceTypeCodes.put(1, ReferenceType.RANGE);
ReferenceTypeCodes.put(2, ReferenceType.PROPERTY);
ReferenceTypeCodes.put(3, ReferenceType.PATH);


///////////////////////////////////////////////////////////////////////////////
// Incoming References
///////////////////////////////////////////////////////////////////////////////

export interface IncomingReferenceEvent extends IncomingProtocolNormalMessage {
  sessionId: string;
  resourceId: string;
  key: string;
  modelPath: Path;
}

export interface ReferenceCleared extends IncomingReferenceEvent {

}


export interface ReferenceRemoved extends IncomingReferenceEvent {
}

export var ReferenceMessageDeserializer: MessageBodyDeserializer<IncomingReferenceEvent> = (body: any) => {
  return {
    sessionId: body.s,
    resourceId: body.r,
    key: body.k,
    modelPath: body.m
  };
};


export interface IncomingReferenceValueEvent extends IncomingReferenceEvent {
  value?: any;
}

export interface ReferenceCreated extends IncomingReferenceValueEvent {
  referenceType: string;
}

export interface ReferenceSet extends IncomingReferenceValueEvent {

}

export var ReferenceValueDeserializer: MessageBodyDeserializer<IncomingReferenceValueEvent> = (body: any) => {
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

export interface OutgoingReferenceEvent extends OutgoingProtocolNormalMessage {
  resourceId: string;
  modelPath: Path;
  key: string;
}

export var ReferenceMessageSerializer: MessageBodySerializer = (message: OutgoingReferenceEvent) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key
  };
};

export interface OutgoingReferenceValueEvent extends OutgoingReferenceEvent {
  value: any;
  version: number;
}

export interface SetReferenceEvent extends OutgoingReferenceValueEvent {
}

export var SetReferenceSerializer: MessageBodySerializer = (message: SetReferenceEvent) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key,
    v: message.value
  };
};

export interface CreateReferenceEvent extends OutgoingReferenceValueEvent {
  referenceType: string;
}

export var CreateReferenceSerializer: MessageBodySerializer = (message: CreateReferenceEvent) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key,
    v: message.value,
    p: ReferenceTypeCodes.code(message.referenceType)
  };
};


export var ReferenceValueSerializer: MessageBodySerializer = (message: OutgoingReferenceValueEvent) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key,
    v: message.value
  };
};
