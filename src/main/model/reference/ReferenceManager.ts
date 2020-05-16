/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ReferenceMap} from "./ReferenceMap";
import {LocalModelReference} from "./LocalModelReference";
import {ModelReference} from "./ModelReference";
import {IndexReference} from "./IndexReference";
import {RealTimeElement, RealTimeModel} from "../rt";
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
import {IdentityCache} from "../../identity/IdentityCache";

/**
 * @hidden
 * @internal
 */
export type OnRemoteReference = (reference: ModelReference) => void;

/**
 * @hidden
 * @internal
 */
export class ReferenceManager {
  private readonly _referenceMap: ReferenceMap;
  private readonly _localReferences: Map<string, LocalModelReference<any, any>>;
  private readonly _validTypes: ReferenceType[];
  private readonly _source: any;
  private readonly _onRemoteReference: OnRemoteReference;
  private readonly _identityCache: IdentityCache;

  constructor(source: any,
              validTypes: ReferenceType[],
              onRemoteReference: OnRemoteReference,
              identityCache: IdentityCache) {
    this._referenceMap = new ReferenceMap();
    this._localReferences = new Map();
    this._validTypes = validTypes;
    this._source = source;
    this._onRemoteReference = onRemoteReference;
    this._identityCache = identityCache;
  }

  public get(sessionId: string, key: string): ModelReference {
    return this._referenceMap.get(sessionId, key);
  }

  public getAll(filter?: ReferenceFilter): ModelReference[] {
    return this._referenceMap.getAll(filter);
  }

  public removeAll(): void {
    this.removeAllLocalReferences();
    this.getAll().forEach(ref => ref._dispose());
  }

  public addLocalReference(reference: LocalModelReference<any, any>): void {
    const key: string = reference.reference().key();
    if (this._localReferences.has(key)) {
      throw new Error(`Local reference already set for key: ${key}`);
    }
    this._localReferences.set(key, reference);
    this._referenceMap.put(reference.reference());
  }

  public removeLocalReference(key: string): void {
    const current: LocalModelReference<any, any> = this._localReferences.get(key);
    if (current !== undefined) {
      current._dispose();
    }
  }

  public removeAllLocalReferences(): void {
    this._localReferences.forEach((reference: LocalModelReference<any, any>, key: string) => {
      this.removeLocalReference(key);
    });
  }

  public getLocalReference(key: string): LocalModelReference<any, any> {
    return this._localReferences.get(key);
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

  public reShare(): void {
    this._localReferences.forEach(reference => {
      if (reference.isShared()) {
        reference.share();
      }
    });
  }

  /**
   * @private
   */
  public _handleReferenceDisposed(reference: ModelReference): void {
    this._referenceMap.remove(reference.sessionId(), reference.key());
    if (reference.isLocal()) {
      this._localReferences.delete(reference.key());
    }
  }

  private _handleRemoteReferenceShared(event: RemoteReferenceShared): void {
    const user = this._identityCache.getUserForSession(event.sessionId);
    let reference: ModelReference;

    const values = event.values;
    this._assertValidType(event.referenceType);

    if (event.referenceType === "index") {
      reference = new IndexReference(this, event.key, this._source, user, event.sessionId, false);
    } else if (event.referenceType === "range") {
      reference = new RangeReference(this, event.key, this._source, user, event.sessionId, false);
    } else if (event.referenceType === "element") {
      reference = new ElementReference(this, event.key, this._source, user, event.sessionId, false);
    } else if (event.referenceType === "property") {
      reference = new PropertyReference(this, event.key, this._source, user, event.sessionId, false);
    } else {
      throw new ConvergenceError("Invalid reference type: " + event);
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
    const reference: ModelReference = this._referenceMap.remove(event.sessionId, event.key);
    reference._dispose();
  }

  private _handleRemoteReferenceCleared(event: RemoteReferenceCleared): void {
    const reference: ModelReference = this._referenceMap.get(event.sessionId, event.key);
    reference._clear();
  }

  private _handleRemoteReferenceSet(event: RemoteReferenceSet): void {
    const reference: ModelReference = this._referenceMap.get(event.sessionId, event.key);
    this._setReferenceValues(reference, event.values);
  }

  private _setReferenceValues(reference: ModelReference, values: any): void {
    // Translate vids to RealTimeElements
    if (reference.type() === ModelReference.Types.ELEMENT) {
      const rtvs: RealTimeElement[] = [];
      for (const id of values) {
        const value: RealTimeElement = (this._source as RealTimeModel)._getRegisteredValue(id);
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
