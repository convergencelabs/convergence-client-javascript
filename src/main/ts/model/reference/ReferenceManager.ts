import {ReferenceMap} from "./ReferenceMap";
import {LocalModelReference} from "./LocalModelReference";
import {MessageType} from "../../connection/protocol/MessageType";
import {
  RemoteReferenceEvent,
  RemoteReferencePublished,
  RemoteReferenceSet,
  RemoteReferenceCleared,
  RemoteReferenceUnpublished
} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ModelReference} from "./ModelReference";
import {IndexReference} from "./IndexReference";
import {RealTimeElement, RealTimeModel} from "../rt/";
import {Immutable} from "../../util/Immutable";
import {RangeReference} from "./RangeReference";
import {ElementReference} from "./ElementReference";
import {PropertyReference} from "./PropertyReference";
import {ReferenceFilter} from "./ReferenceFilter";

/**
 * @hidden
 * @internal
 */
export type OnRemoteReference = (reference: ModelReference<any>) => void;

/**
 * @hidden
 * @internal
 */
export class ReferenceManager {
  private readonly _referenceMap: ReferenceMap;
  private readonly _localReferences: {[key: string]: LocalModelReference<any, any>};
  private readonly _validTypes: string[];
  private readonly _source: any;
  private readonly _onRemoteReference: OnRemoteReference;

  constructor(source: any, validTypes: string[], onRemoteReference: OnRemoteReference) {
    this._referenceMap = new ReferenceMap();
    this._localReferences = {};
    this._validTypes = validTypes;
    this._source = source;
    this._onRemoteReference = onRemoteReference;
  }

  public get(sessionId: string, key: string): ModelReference<any> {
    return this._referenceMap.get(sessionId, key);
  }

  public getAll(filter?: ReferenceFilter): Array<ModelReference<any>> {
    return this._referenceMap.getAll(filter);
  }

  public removeAll(): void {
    this.getAll().forEach(ref => ref._dispose());
  }

  public addLocalReference(reference: LocalModelReference<any, any>): void {
    const key: string = reference.reference().key();
    if (this._localReferences[key] !== undefined) {
      throw new Error(`Local reference already set for key: ${key}`);
    }
    this._localReferences[key] = reference;
    this._referenceMap.put(reference.reference());
  }

  public removeLocalReference(key: string): void {
    const current: LocalModelReference<any, any> = this._localReferences[key];
    if (current !== undefined) {
      current.dispose();
    }
  }

  public removeAllLocalReferences(): void {
    const keys: string[] = Object.getOwnPropertyNames(this._localReferences);
    keys.forEach((key: string) => {
      this.removeLocalReference(key);
    });
  }

  public getLocalReference(key: string): LocalModelReference<any, any> {
    return this._localReferences[key];
  }

  public localReferences(): {[key: string]: LocalModelReference<any, any>} {
    return Immutable.copy(this._localReferences);
  }

  public handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    switch (event.type) {
      case MessageType.REFERENCE_PUBLISHED:
        this._handleRemoteReferencePublished(event as RemoteReferencePublished);
        break;
      case MessageType.REFERENCE_SET:
        this._handleRemoteReferenceSet(event as RemoteReferenceSet);
        break;
      case MessageType.REFERENCE_CLEARED:
        this._handleRemoteReferenceCleared(event as RemoteReferenceCleared);
        break;
      case MessageType.REFERENCE_UNPUBLISHED:
        this._handleRemoteReferenceUnpublished(event as RemoteReferenceUnpublished);
        break;
      default:
        throw new Error("Invalid reference event.");
    }
  }

  public _handleReferenceDisposed(reference: ModelReference<any>): void {
    this._referenceMap.remove(reference.sessionId(), reference.key());
    if (reference.isLocal()) {
      delete this._localReferences[reference.key()];
    }
  }

  private _handleRemoteReferencePublished(event: RemoteReferencePublished): void {
    if (this._validTypes.indexOf(event.referenceType) < 0) {
      throw new Error(`Invalid reference type: ${event.referenceType}`);
    }

    const username: string = event.username;
    let reference: ModelReference<any>;
    switch (event.referenceType) {
      case ModelReference.Types.INDEX:
        reference = new IndexReference(this, event.key, this._source, username, event.sessionId, false);
        break;
      case ModelReference.Types.RANGE:
        reference = new RangeReference(this, event.key, this._source, username, event.sessionId, false);
        break;
      case ModelReference.Types.ELEMENT:
        reference = new ElementReference(this, event.key, this._source, username, event.sessionId, false);
        break;
      case ModelReference.Types.PROPERTY:
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
    // Translate vids to RealTimeElements
    if (reference.type() === ModelReference.Types.ELEMENT) {
      const rtvs: Array<RealTimeElement<any>> = [];
      for (const id of values) {
        const value: RealTimeElement<any> = (this._source as RealTimeModel)._getRegisteredValue(id);
        if (value !== undefined) {
          rtvs.push(value);
        }
      }
      reference._set(rtvs);
    } else {
      reference._set(values);
    }
  }
}
