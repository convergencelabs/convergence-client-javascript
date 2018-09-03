import {MessageBodySerializer} from "../../MessageSerializer";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {CodeMap} from "../../../../util/CodeMap";
import {OutgoingProtocolNormalMessage} from "../../protocol";
import {IncomingProtocolNormalMessage} from "../../protocol";
import {ModelReference} from "../../../../model/reference/ModelReference";
import {IndexRange} from "../../../../model/reference/RangeReference";
import {SessionIdParser} from "../../SessionIdParser";

///////////////////////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////////////////////

/**
 * @hidden
 * @internal
 */
export const ReferenceTypeCodes: CodeMap = new CodeMap();
ReferenceTypeCodes.put(0, ModelReference.Types.INDEX);
ReferenceTypeCodes.put(1, ModelReference.Types.RANGE);
ReferenceTypeCodes.put(2, ModelReference.Types.PROPERTY);
ReferenceTypeCodes.put(3, ModelReference.Types.ELEMENT);

///////////////////////////////////////////////////////////////////////////////
// Incoming References
///////////////////////////////////////////////////////////////////////////////

/**
 * @hidden
 * @internal
 */
export interface RemoteReferenceEvent extends IncomingProtocolNormalMessage {
  sessionId: string;
  username: string;
  resourceId: string;
  key: string;
  id: string;
}

/**
 * @hidden
 * @internal
 */
// fixme this should be shared, not publish.  This is in a bunch of places.
export interface RemoteReferencePublished extends RemoteReferenceEvent {
  referenceType: string;
  values?: any[];
}

/**
 * @hidden
 * @internal
 */
export interface RemoteReferenceUnpublished extends RemoteReferenceEvent {
}

/**
 * @hidden
 * @internal
 */
export interface RemoteReferenceSet extends RemoteReferenceEvent {
  referenceType: string;
  values: any[];
}

/**
 * @hidden
 * @internal
 */
export interface RemoteReferenceCleared extends RemoteReferenceEvent {
}

/**
 * @hidden
 * @internal
 */
export const RemoteReferencePublishedDeserializer: MessageBodyDeserializer<RemoteReferencePublished> = (body: any) => {
  const type: string = ReferenceTypeCodes.value(body.c);
  const values: any = deserializeReferenceValues(body.v, type);

  const result: RemoteReferencePublished = {
    resourceId: body.r,
    sessionId: body.s,
    username: SessionIdParser.parseUsername(body.s),
    key: body.k,
    id: body.d,
    referenceType: type,
    values
  };
  return result;
};

/**
 * @hidden
 * @internal
 */
export function deserializeReferenceValues(values: any, type: string): any {
  "use strict";
  if (values === undefined) {
    return;
  }

  switch (type) {
    case ModelReference.Types.INDEX:
    case ModelReference.Types.PROPERTY:
    case ModelReference.Types.ELEMENT:
      return values;
    case ModelReference.Types.RANGE:
      const ranges: IndexRange[] = [];

      for (const range of values) {
        ranges.push({
          start: range[0],
          end: range[1]
        });
      }

      return ranges;
    default:
      throw new Error("Invalid reference type");
  }
}

/**
 * @hidden
 * @internal
 */
export const RemoteReferenceSetDeserializer: MessageBodyDeserializer<RemoteReferenceSet> = (body: any) => {
  const type: string = ReferenceTypeCodes.value(body.c);
  const values: any = deserializeReferenceValues(body.v, type);
  const result: RemoteReferenceSet = {
    resourceId: body.r,
    sessionId: body.s,
    username: SessionIdParser.parseUsername(body.s),
    key: body.k,
    id: body.d,
    referenceType: type,
    values
  };
  return result;
};

/**
 * @hidden
 * @internal
 */
const ReferenceMessageDeserializer: MessageBodyDeserializer<RemoteReferenceEvent> = (body: any) => {
  const result: RemoteReferenceEvent = {
    sessionId: body.s,
    username: SessionIdParser.parseUsername(body.s),
    resourceId: body.r,
    key: body.k,
    id: body.d
  };
  return result;
};

/**
 * @hidden
 * @internal
 */
export const RemoteReferenceClearedDeserializer: MessageBodyDeserializer<RemoteReferenceCleared> =
  ReferenceMessageDeserializer;

/**
 * @hidden
 * @internal
 */
export const RemoteReferenceUnpublishedDeserializer: MessageBodyDeserializer<RemoteReferenceUnpublished> =
  ReferenceMessageDeserializer;

///////////////////////////////////////////////////////////////////////////////
// Outgoing References
///////////////////////////////////////////////////////////////////////////////

/**
 * @hidden
 * @internal
 */
export interface OutgoingReferenceEvent extends OutgoingProtocolNormalMessage {
  resourceId: string;
  id: string;
  key: string;
}

/**
 * @hidden
 * @internal
 */
export interface PublishReferenceEvent extends OutgoingReferenceEvent {
  referenceType: string;
  values?: any;
  version?: number;
}

/**
 * @hidden
 * @internal
 */
export interface UnpublishReferenceEvent extends OutgoingReferenceEvent {
}

/**
 * @hidden
 * @internal
 */
export interface SetReferenceEvent extends OutgoingReferenceEvent {
  referenceType: string;
  values: any;
  version: number;
}

/**
 * @hidden
 * @internal
 */
export interface ClearReferenceEvent extends OutgoingReferenceEvent {
}

/**
 * @hidden
 * @internal
 */
export const PublishReferenceSerializer: MessageBodySerializer = (message: PublishReferenceEvent) => {
  return {
    r: message.resourceId,
    d: message.id,
    k: message.key,
    c: ReferenceTypeCodes.code(message.referenceType),
    v: serializeReferenceValue(message.values, message.referenceType),
    s: message.version
  };
};

/**
 * @hidden
 * @internal
 */
export const UnpublishReferenceSerializer: MessageBodySerializer = (message: UnpublishReferenceEvent) => {
  return {
    r: message.resourceId,
    d: message.id,
    k: message.key
  };
};

function serializeReferenceValue(values: any, type: string): any {
  "use strict";
  if (values === undefined) {
    return;
  }

  switch (type) {
    case ModelReference.Types.INDEX:
    case ModelReference.Types.PROPERTY:
    case ModelReference.Types.ELEMENT:
      return values;
    case ModelReference.Types.RANGE:
      const ranges: number[][] = [];
      for (const range of values) {
        ranges.push([range.start, range.end]);
      }
      return ranges;
    default:
      throw new Error("Invalid reference type");
  }
}

/**
 * @hidden
 * @internal
 */
export const SetReferenceSerializer: MessageBodySerializer = (message: SetReferenceEvent) => {
  return {
    r: message.resourceId,
    d: message.id,
    k: message.key,
    c: ReferenceTypeCodes.code(message.referenceType),
    v: serializeReferenceValue(message.values, message.referenceType),
    s: message.version
  };
};

/**
 * @hidden
 * @internal
 */
export const ClearReferenceMessageSerializer: MessageBodySerializer = (message: ClearReferenceEvent) => {
  return {
    r: message.resourceId,
    d: message.id,
    k: message.key
  };
};
