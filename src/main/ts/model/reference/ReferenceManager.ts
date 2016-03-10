import {ReferenceMap} from "./ReferenceMap";
import {LocalModelReference} from "./LocalModelReference";
import MessageType from "../../connection/protocol/MessageType";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RemoteReferencePublished} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RemoteReferenceSet} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RemoteReferenceCleared} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RemoteReferenceUnpublished} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {IndexReference} from "./IndexReference";
import {RealTimeValue} from "../RealTimeValue";
import Immutable from "../../util/Immutable";
import {RangeReference} from "./RangeReference";

export class ReferenceManager {
  private _referenceMap: ReferenceMap;
  private _localReferences: {[key: string]: LocalModelReference<any, any>};
  private _validTypes: string[];
  private _source: RealTimeValue<any>;

  constructor(source: RealTimeValue<any>, validTypes: string[]) {
    this._referenceMap = new ReferenceMap();
    this._localReferences = {};
    this._validTypes = validTypes;
    this._source = source;
  }

  referenceMap(): ReferenceMap {
    return this._referenceMap;
  }

  addLocalReference(reference: LocalModelReference<any, any>): void {
    var key: string = reference.reference().key();
    if (this._localReferences[key] !== undefined) {
      throw new Error(`Local reference already set for key: ${key}`);
    }
    this._localReferences[key] = reference;
  }

  removeLocalReference(key: string): void {
    var current: LocalModelReference<any, any> = this._localReferences[key];
    if (current !== undefined) {
      current.dispose();
      delete this._localReferences[key];
    }
  }

  removeAllLocalReferences(): void {
    var keys: string[] = Object.getOwnPropertyNames(this._localReferences);
    keys.forEach((key: string) => {
      this.removeLocalReference(key);
    });
  }

  getLocalReference(key: string): LocalModelReference<any, any> {
    return this._localReferences[key];
  }

  localReferences(): {[key: string]: LocalModelReference<any, any>} {
    return Immutable.copy(this._localReferences);
  }

  handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    switch (event.type) {
      case MessageType.REFERENCE_PUBLISHED:
        this._handleRemoteReferencePublished(<RemoteReferencePublished>event);
        break;
      case MessageType.REFERENCE_SET:
        this._handleRemoteReferenceSet(<RemoteReferenceSet>event);
        break;
      case MessageType.REFERENCE_CLEARED:
        this._handleRemoteReferenceCleared(<RemoteReferenceCleared>event);
        break;
      case MessageType.REFERENCE_UNPUBLISHED:
        this._handleRemoteReferenceUnpublished(<RemoteReferenceUnpublished>event);
        break;
      default:
        throw new Error("Invalid reference event.");
    }
  }

  private _handleRemoteReferencePublished(event: RemoteReferencePublished): void {
    if (this._validTypes.indexOf(event.referenceType) < 0) {
      throw new Error(`Invalid reference type for RealTimeString: ${event.referenceType}`);
    }

    var userId: string = event.sessionId; // fixme - need to fix userid / session id encoding.
    var reference: ModelReference<any>;
    switch (event.referenceType) {
      case ReferenceType.INDEX:
        reference = new IndexReference(event.key, this._source, userId, event.sessionId, false);
        break;
      case ReferenceType.RANGE:
        reference = new RangeReference(event.key, this._source, userId, event.sessionId, false);
        break;
      default:
        break;
    }

    this._referenceMap.put(reference);
  }

  private _handleRemoteReferenceUnpublished(event: RemoteReferenceUnpublished): void {
    var reference: ModelReference<any> = this._referenceMap.remove(event.sessionId, event.key);
    reference._dispose();
  }

  private _handleRemoteReferenceCleared(event: RemoteReferenceCleared): void {
    var reference: ModelReference<any> = this._referenceMap.get(event.sessionId, event.key);
    reference._clear();
  }

  private _handleRemoteReferenceSet(event: RemoteReferenceSet): void {
    var reference: ModelReference<any> = this._referenceMap.get(event.sessionId, event.key);
    reference._set(event.value);
  }
}
