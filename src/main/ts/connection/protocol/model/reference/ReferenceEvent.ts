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

export interface RemoteReferenceEvent extends IncomingProtocolNormalMessage {
  sessionId: string;
  resourceId: string;
  key: string;
  path: Path;
}

export interface RemoteReferencePublished extends RemoteReferenceEvent {
  referenceType: string;
}

export interface RemoteReferenceUnpublished extends RemoteReferenceEvent {
}

export interface RemoteReferenceSet extends RemoteReferenceEvent {
  referenceType: string;
  value: any;
}

export interface RemoteReferenceCleared extends RemoteReferenceEvent {
}

export var RemoteReferencePublishedDeserializer: MessageBodyDeserializer<RemoteReferencePublished> = (body: any) => {
  var result: RemoteReferencePublished = {
    resourceId: body.r,
    sessionId: body.s,
    key: body.k,
    path: body.p,
    referenceType: ReferenceTypeCodes.value(body.c)
  };
  return result;
};

export var RemoteReferenceSetDeserializer: MessageBodyDeserializer<RemoteReferenceSet> = (body: any) => {
  var result: RemoteReferenceSet = {
    resourceId: body.r,
    sessionId: body.s,
    key: body.k,
    path: body.p,
    referenceType: ReferenceTypeCodes.value(body.c),
    value: body.v
  };
  return result;
};

var ReferenceMessageDeserializer: MessageBodyDeserializer<RemoteReferenceEvent> = (body: any) => {
  var result: RemoteReferenceEvent = {
    sessionId: body.s,
    resourceId: body.r,
    key: body.k,
    path: body.p
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
  path: Path;
  key: string;
}

export interface PublishReferenceEvent extends OutgoingReferenceEvent {
  referenceType: string;
}

export interface UnpublishReferenceEvent extends OutgoingReferenceEvent {
}

export interface SetReferenceEvent extends OutgoingReferenceEvent {
  referenceType: string;
  value: any;
}

export interface ClearReferenceEvent extends OutgoingReferenceEvent {
}


export var PublishReferenceSerializer: MessageBodySerializer = (message: PublishReferenceEvent) => {
  return {
    r: message.resourceId,
    p: message.path,
    k: message.key,
    c: ReferenceTypeCodes.code(message.referenceType)
  };
};

export var UnpublishReferenceSerializer: MessageBodySerializer = (message: UnpublishReferenceEvent) => {
  return {
    r: message.resourceId,
    p: message.path,
    k: message.key
  };
};


export var SetReferenceSerializer: MessageBodySerializer = (message: SetReferenceEvent) => {
  return {
    r: message.resourceId,
    p: message.path,
    k: message.key,
    c: ReferenceTypeCodes.code(message.referenceType),
    v: message.value
  };
};

export var ClearReferenceMessageSerializer: MessageBodySerializer = (message: ClearReferenceEvent) => {
  return {
    r: message.resourceId,
    p: message.path,
    k: message.key
  };
};
