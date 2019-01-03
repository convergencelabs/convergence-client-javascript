import {ReferenceMap} from "./ReferenceMap";
import {LocalModelReference} from "./LocalModelReference";
import {ModelReference} from "./ModelReference";
import {IndexReference} from "./IndexReference";
import {RealTimeElement, RealTimeModel} from "../rt/";
import {Immutable} from "../../util/Immutable";
import {RangeReference} from "./RangeReference";
import {ElementReference} from "./ElementReference";
import {PropertyReference} from "./PropertyReference";
import {ReferenceFilter} from "./ReferenceFilter";
import {ReferenceType} from "./ReferenceType";
import {
  RemoteReferenceCleared,
  RemoteReferenceEvent,
  RemoteReferenceSet,
  RemoteReferenceShared,
  RemoteReferenceUnshared
} from "./RemoteReferenceEvent";
import {ConvergenceError} from "../../util";

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
  private readonly _localReferences: { [key: string]: LocalModelReference<any, any> };
  private readonly _validTypes: ReferenceType[];
  private readonly _source: any;
  private readonly _onRemoteReference: OnRemoteReference;

  constructor(source: any, validTypes: ReferenceType[], onRemoteReference: OnRemoteReference) {
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

  public localReferences(): { [key: string]: LocalModelReference<any, any> } {
    return Immutable.copy(this._localReferences);
  }

  public handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    if (event instanceof RemoteReferenceShared) {
      this._handleRemoteReferenceShared(event);
    } else if (event instanceof RemoteReferenceSet) {
      this._handleRemoteReferenceSet(event);
    } else if (event instanceof RemoteReferenceCleared) {
      this._handleRemoteReferenceCleared(event);
    } else if (event instanceof RemoteReferenceUnshared) {
      this._handleRemoteReferenceUnshared(event);
    } else {
      throw new Error("Invalid reference event.");
    }
  }

  public _handleReferenceDisposed(reference: ModelReference<any>): void {
    this._referenceMap.remove(reference.sessionId(), reference.key());
    if (reference.isLocal()) {
      delete this._localReferences[reference.key()];
    }
  }

  private _handleRemoteReferenceShared(event: RemoteReferenceShared): void {
    // fixme username
    const username = "";
    let reference: ModelReference<any>;

    const values = event.values;
    this._assertValidType(event.referenceType);

    if (event.referenceType === "index") {
      reference = new IndexReference(this, event.key, this._source, username, event.sessionId, false);
    } else if (event.referenceType === "range") {
      reference = new RangeReference(this, event.key, this._source, username, event.sessionId, false);
    } else if (event.referenceType === "element") {
      reference = new ElementReference(this, event.key, this._source, username, event.sessionId, false);
    } else if (event.referenceType === "property") {
      reference = new PropertyReference(this, event.key, this._source, username, event.sessionId, false);
    } else {
      throw new ConvergenceError("Invalid reference message: " + event);
    }

    if (values !== null) {
      this._setReferenceValues(reference, values);
    }

    this._referenceMap.put(reference);
    this._onRemoteReference(reference);
  }

  private _assertValidType(referenceType: ReferenceType): void {
    if (!this._validTypes.includes(referenceType)) {
      throw new Error(`Invalid reference type: ${referenceType}`);
    }
  }

  private _handleRemoteReferenceUnshared(event: RemoteReferenceUnshared): void {
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

  private _setReferenceValues(reference: ModelReference<any>, values: any): void {
    // Translate vids to RealTimeElements
    if (reference.type() === ModelReference.Types.ELEMENT) {
      const rtvs: Array<RealTimeElement<any>> = [];
      for (const id of values) {
        const value: RealTimeElement<any> = (this._source as RealTimeModel)._getRegisteredValue(id);
        if (value !== undefined) {
          rtvs.push(value);
        }
      }
      reference._set(rtvs, false);
    } else {
      reference._set(values, false);
    }
  }
}
