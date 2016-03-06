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

export interface RemoteReferencePublished extends IncomingReferenceEvent {
  referenceType: string;
}

export interface RemoteReferenceUnpublished extends IncomingReferenceEvent {
}

export interface RemoteReferenceSet extends IncomingReferenceEvent {
  value: any;
}

export interface RemoteReferenceCleared extends IncomingReferenceEvent {
}

export var RemoteReferencePublishedDeserializer: MessageBodyDeserializer<RemoteReferencePublished> = (body: any) => {
  var result: RemoteReferencePublished = {
    resourceId: body.r,
    sessionId: body.s,
    key: body.k,
    modelPath: body.m,
    referenceType: ReferenceTypeCodes.value(body.p)
  };
  return result;
};

export var RemoteReferenceSetDeserializer: MessageBodyDeserializer<RemoteReferenceSet> = (body: any) => {
  var result: RemoteReferenceSet = {
    resourceId: body.r,
    sessionId: body.s,
    key: body.k,
    modelPath: body.m,
    value: body.v
  };
  return result;
};

var ReferenceMessageDeserializer: MessageBodyDeserializer<IncomingReferenceEvent> = (body: any) => {
  var result: IncomingReferenceEvent = {
    sessionId: body.s,
    resourceId: body.r,
    key: body.k,
    modelPath: body.m
  };
  return result;
};

export var RemoteReferenceClearedDeserializer: MessageBodyDeserializer<RemoteReferenceCleared> = ReferenceMessageDeserializer;
export var RemoteReferenceUnpublishedDeserializer: MessageBodyDeserializer<RemoteReferenceUnpublished> = ReferenceMessageDeserializer;


///////////////////////////////////////////////////////////////////////////////
// Outgoing References
///////////////////////////////////////////////////////////////////////////////

export interface OutgoingReferenceEvent extends OutgoingProtocolNormalMessage {
  resourceId: string;
  modelPath: Path;
  key: string;
}

export interface PublishReferenceEvent extends OutgoingReferenceEvent {
  referenceType: string;
}

export interface UnpublishReferenceEvent extends OutgoingReferenceEvent {
}

export interface SetReferenceEvent extends OutgoingReferenceEvent {
  version: number;
  value: any;
}

export interface ClearReferenceEvent extends OutgoingReferenceEvent {
}


export var PublishReferenceSerializer: MessageBodySerializer = (message: PublishReferenceEvent) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key,
    p: ReferenceTypeCodes.code(message.referenceType)
  };
};

export var UnpublishReferenceSerializer: MessageBodySerializer = (message: UnpublishReferenceEvent) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key
  };
};


export var SetReferenceSerializer: MessageBodySerializer = (message: SetReferenceEvent) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key,
    u: message.value,
    v: message.version
  };
};

export var ClearReferenceMessageSerializer: MessageBodySerializer = (message: ClearReferenceEvent) => {
  return {
    r: message.resourceId,
    m: message.modelPath,
    k: message.key
  };
};
