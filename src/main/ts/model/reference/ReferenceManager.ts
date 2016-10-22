import {ReferenceMap} from "./ReferenceMap";
import {LocalModelReference} from "./LocalModelReference";
import {MessageType} from "../../connection/protocol/MessageType";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RemoteReferencePublished} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RemoteReferenceSet} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RemoteReferenceCleared} from "../../connection/protocol/model/reference/ReferenceEvent";
import {RemoteReferenceUnpublished} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {IndexReference} from "./IndexReference";
import {RealTimeValue} from "../rt/RealTimeValue";
import {Immutable} from "../../util/Immutable";
import {RangeReference} from "./RangeReference";
import {ElementReference} from "./ElementReference";
import {RealTimeModel} from "../rt/RealTimeModel";
import {PropertyReference} from "./PropertyReference";
import {ReferenceFilter} from "./ReferenceFilter";

export type OnRemoteReference = (reference: ModelReference<any>) => void;

export class ReferenceManager {
  private _referenceMap: ReferenceMap;
  private _localReferences: {[key: string]: LocalModelReference<any, any>};
  private _validTypes: string[];
  private _source: any;
  private _onRemoteReference: OnRemoteReference;

  constructor(source: any, validTypes: string[], onRemoteReference: OnRemoteReference) {
    this._referenceMap = new ReferenceMap();
    this._localReferences = {};
    this._validTypes = validTypes;
    this._source = source;
    this._onRemoteReference = onRemoteReference;
  }

  get(sessionId: string, key: string): ModelReference<any> {
    return this._referenceMap.get(sessionId, key);
  }

  getAll(filter?: ReferenceFilter): ModelReference<any>[] {
    return this._referenceMap.getAll(filter);
  }

  removeAll(): void {
    this.getAll().forEach(ref => ref._dispose());
  }

  addLocalReference(reference: LocalModelReference<any, any>): void {
    const key: string = reference.reference().key();
    if (this._localReferences[key] !== undefined) {
      throw new Error(`Local reference already set for key: ${key}`);
    }
    this._localReferences[key] = reference;
    this._referenceMap.put(reference.reference());
  }

  removeLocalReference(key: string): void {
    const current: LocalModelReference<any, any> = this._localReferences[key];
    if (current !== undefined) {
      current.dispose();
    }
  }

  removeAllLocalReferences(): void {
    const keys: string[] = Object.getOwnPropertyNames(this._localReferences);
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
      throw new Error(`Invalid reference type: ${event.referenceType}`);
    }

    const username: string = event.username;
    let reference: ModelReference<any>;
    switch (event.referenceType) {
      case ReferenceType.INDEX:
        reference = new IndexReference(this, event.key, this._source, username, event.sessionId, false);
        break;
      case ReferenceType.RANGE:
        reference = new RangeReference(this, event.key, this._source, username, event.sessionId, false);
        break;
      case ReferenceType.ELEMENT:
        reference = new ElementReference(this, event.key, this._source, username, event.sessionId, false);
        break;
      case ReferenceType.PROPERTY:
        reference = new PropertyReference(this, event.key, this._source, username, event.sessionId, false);
        break;
      default:
        throw new Error("Unknown reference type: " + event.referenceType);
    }

    if (event.values !== undefined) {
      this._setReferenceValues(reference, event.values);
    }

    this._referenceMap.put(reference);
    this._onRemoteReference(reference);
  }

  private _handleRemoteReferenceUnpublished(event: RemoteReferenceUnpublished): void {
    const reference: ModelReference<any> = this._referenceMap.remove(event.sessionId, event.key);
    reference._dispose();
  }

  private _handleRemoteReferenceCleared(event: RemoteReferenceCleared): void {
    const reference: ModelReference<any> = this._referenceMap.get(event.sessionId, event.key);
    reference._clear();
  }

  private _handleRemoteReferenceSet(event: RemoteReferenceSet): void {
    const reference: ModelReference<any> = this._referenceMap.get(event.sessionId, event.key);
    this._setReferenceValues(reference, event.values);
  }

  private _setReferenceValues(reference: ModelReference<any> , values: any): void {
    // Translate vids to RealTimeValues
    if (reference.type() === ReferenceType.ELEMENT) {
      const rtvs: RealTimeValue<any>[] = [];
      for (var id of values) {
        let value: RealTimeValue<any> = (<RealTimeModel>this._source)._getRegisteredValue(id);
        if (value !== undefined) {
          rtvs.push(value);
        }
      }
      reference._set(rtvs);
    } else {
      reference._set(values);
    }
  }

  _handleReferenceDisposed(reference: ModelReference<any>): void {
    this._referenceMap.remove(reference.sessionId(), reference.key());
    if (reference.isLocal()) {
      delete this._localReferences[reference.key()];
    }
  }
}
