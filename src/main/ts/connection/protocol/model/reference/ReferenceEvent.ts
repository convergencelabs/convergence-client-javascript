import {MessageBodySerializer} from "../../MessageSerializer";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {CodeMap} from "../../../../util/CodeMap";
import {OutgoingProtocolNormalMessage} from "../../protocol";
import {IncomingProtocolNormalMessage} from "../../protocol";
import {ReferenceType} from "../../../../model/reference/ModelReference";
import {IndexRange} from "../../../../model/reference/RangeReference";
import {SessionIdParser} from "../../SessionIdParser";

///////////////////////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////////////////////

export var ReferenceTypeCodes: CodeMap = new CodeMap();
ReferenceTypeCodes.put(0, ReferenceType.INDEX);
ReferenceTypeCodes.put(1, ReferenceType.RANGE);
ReferenceTypeCodes.put(2, ReferenceType.PROPERTY);
ReferenceTypeCodes.put(3, ReferenceType.PATH);


///////////////////////////////////////////////////////////////////////////////
// Incoming References
///////////////////////////////////////////////////////////////////////////////

export interface RemoteReferenceEvent extends IncomingProtocolNormalMessage {
  sessionId: string;
  userId: string;
  resourceId: string;
  key: string;
  id: string;
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
    userId: SessionIdParser.deserialize(body.s).userId,
    key: body.k,
    id: body.d,
    referenceType: ReferenceTypeCodes.value(body.c)
  };
  return result;
};

export function deserializeReferenceValue(value: any, type: string): any {
  "use strict";
  if (value === undefined) {
    return;
  }

  switch (type) {
    case ReferenceType.INDEX:
      return value;
    case ReferenceType.RANGE:
      var range: IndexRange = {
        start: value[0],
        end: value[1]
      };
      return range;
    default:
      throw new Error("Invalid reference type");
  }
};

export var RemoteReferenceSetDeserializer: MessageBodyDeserializer<RemoteReferenceSet> = (body: any) => {
  var type: string = ReferenceTypeCodes.value(body.c);
  var value: any = deserializeReferenceValue(body.v, type);
  var result: RemoteReferenceSet = {
    resourceId: body.r,
    sessionId: body.s,
    userId: SessionIdParser.deserialize(body.s).userId,
    key: body.k,
    id: body.d,
    referenceType: type,
    value: value
  };
  return result;
};

var ReferenceMessageDeserializer: MessageBodyDeserializer<RemoteReferenceEvent> = (body: any) => {
  var result: RemoteReferenceEvent = {
    sessionId: body.s,
    userId: SessionIdParser.deserialize(body.s).userId,
    resourceId: body.r,
    key: body.k,
    id: body.d
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
  id: string;
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
  version: number;
}

export interface ClearReferenceEvent extends OutgoingReferenceEvent {
}


export var PublishReferenceSerializer: MessageBodySerializer = (message: PublishReferenceEvent) => {
  return {
    r: message.resourceId,
    d: message.id,
    k: message.key,
    c: ReferenceTypeCodes.code(message.referenceType)
  };
};

export var UnpublishReferenceSerializer: MessageBodySerializer = (message: UnpublishReferenceEvent) => {
  return {
    r: message.resourceId,
    d: message.id,
    k: message.key
  };
};

function seserializeReferenceValue(value: any, type: string): any {
  "use strict";
  switch (type) {
    case ReferenceType.INDEX:
      return value;
    case ReferenceType.RANGE:
      var range: IndexRange = <IndexRange>value;
      return [range.start, range.end];
    default:
      throw new Error("Invalid reference type");
  }
};

export var SetReferenceSerializer: MessageBodySerializer = (message: SetReferenceEvent) => {
  return {
    r: message.resourceId,
    d: message.id,
    k: message.key,
    c: ReferenceTypeCodes.code(message.referenceType),
    v: seserializeReferenceValue(message.value, message.referenceType),
    s: message.version
  };
};

export var ClearReferenceMessageSerializer: MessageBodySerializer = (message: ClearReferenceEvent) => {
  return {
    r: message.resourceId,
    d: message.id,
    k: message.key
  };
};
