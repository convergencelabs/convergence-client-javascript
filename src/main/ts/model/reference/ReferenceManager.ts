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
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IRemoteReferencePublishedMessage = io.convergence.proto.IRemoteReferencePublishedMessage;
import IRemoteReferenceUnpublishedMessage = io.convergence.proto.IRemoteReferenceUnpublishedMessage;
import IRemoteReferenceClearedMessage = io.convergence.proto.IRemoteReferenceClearedMessage;
import IRemoteReferenceSetMessage = io.convergence.proto.IRemoteReferenceSetMessage;
import {ReferenceType} from "./ReferenceType";

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

  public handleRemoteReferenceEvent(message: IConvergenceMessage): void {
    if (message.referencePublished) {
      this._handleRemoteReferencePublished(message.referencePublished);
    } else if (message.referenceSet) {
      this._handleRemoteReferenceSet(message.referenceSet);
    } else if (message.referenceCleared) {
      this._handleRemoteReferenceCleared(message.referenceCleared);
    } else if (message.referenceUnpublished) {
      this._handleRemoteReferenceUnpublished(message.referenceUnpublished);
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

  private _handleRemoteReferencePublished(message: IRemoteReferencePublishedMessage): void {
    // fixme username
    const username = "";
    let reference: ModelReference<any>;

    let values = [];

    if (message.references.indices) {
      this._assertValidType("index");
      reference = new IndexReference(this, message.key, this._source, username, message.sessionId, false);
      values = message.references.indices.values;
    } else if (message.references.ranges) {
      this._assertValidType("range");
      reference = new RangeReference(this, message.key, this._source, username, message.sessionId, false);
      values = message.references.ranges.values.map(r => {
        return {start: r.startIndex, end: r.endIndex};
      });
    } else if (message.references.elements) {
      this._assertValidType("element");
      reference = new ElementReference(this, message.key, this._source, username, message.sessionId, false);
      values = message.references.elements.values;
    } else if (message.references.properties) {
      this._assertValidType("property");
      reference = new PropertyReference(this, message.key, this._source, username, message.sessionId, false);
      values = message.references.properties.values;
    } else {
      throw new Error("Invalid reference message: " + message);
    }

    if (values !== undefined) {
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

  private _handleRemoteReferenceUnpublished(message: IRemoteReferenceUnpublishedMessage): void {
    const reference: ModelReference<any> = this._referenceMap.remove(message.sessionId, message.key);
    reference._dispose();
  }

  private _handleRemoteReferenceCleared(message: IRemoteReferenceClearedMessage): void {
    const reference: ModelReference<any> = this._referenceMap.get(message.sessionId, message.key);
    reference._clear();
  }

  private _handleRemoteReferenceSet(message: IRemoteReferenceSetMessage): void {
    const reference: ModelReference<any> = this._referenceMap.get(message.sessionId, message.key);
    let values = [];
    if (message.references.indices) {
      this._assertValidType("index");
      values = message.references.indices.values;
    } else if (message.references.ranges) {
      this._assertValidType("range");
      values = message.references.ranges.values.map(r => {
        return {start: r.startIndex, end: r.endIndex};
      });
    } else if (message.references.elements) {
      this._assertValidType("element");
      values = message.references.elements.values;
    } else if (message.references.properties) {
      this._assertValidType("property");
      values = message.references.properties.values;
    } else {
      throw new Error("Invalid reference message: " + message);
    }
    this._setReferenceValues(reference, values);
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
