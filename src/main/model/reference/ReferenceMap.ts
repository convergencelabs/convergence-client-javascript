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

import {ModelReference} from "./ModelReference";
import {ReferenceFilter} from "./ReferenceFilter";
import {TypeChecker} from "../../util/TypeChecker";

/**
 * @hidden
 * @internal
 */
export class ReferenceMap {

  /**
   * Contains references mapped first by sessionId and then by reference key.
   */
  private _referencesBySessionId: Map<string, Map<string, ModelReference>>;

  constructor() {
    this._referencesBySessionId = new Map();
  }

  public put(reference: ModelReference): void {
    const sessionId = reference.sessionId();
    const key = reference.key();

    let sessionReferences = this._referencesBySessionId.get(sessionId);
    if (TypeChecker.isUndefined(sessionReferences)) {
      sessionReferences = new Map();
      this._referencesBySessionId.set(sessionId, sessionReferences);
    }

    if (sessionReferences.has(key)) {
      throw new Error(`Reference with key "${key}" already exists for session "${sessionId}".`);
    }

    sessionReferences.set(key, reference);
  }

  public get(sessionId: string, key: string): ModelReference {
    const sessionReferences = this._referencesBySessionId.get(sessionId);
    if (!TypeChecker.isUndefined(sessionReferences)) {
      return sessionReferences.get(key);
    } else {
      return;
    }
  }

  public getAll(filter?: ReferenceFilter): ModelReference[] {
    if (TypeChecker.isUndefined(filter)) {
      filter = {};
    }

    const refs: ModelReference[] = [];

    const sessionIds: string[] = TypeChecker.isSet(filter.sessionId) ?
      [filter.sessionId] :
      Array.from(this._referencesBySessionId.keys());

    sessionIds.forEach((sid: string) => {
      const sessionRefs = this._referencesBySessionId.get(sid);
      const keys: string[] = TypeChecker.isSet(filter.key) ? [filter.key] : Array.from(sessionRefs.keys());
      keys.forEach((k: string) => {
        const r: ModelReference = sessionRefs.get(k);
        if (!TypeChecker.isUndefined(r)) {
          refs.push(r);
        }
      });
    });

    return refs;
  }

  public removeAll(): void {
    this._referencesBySessionId.clear();
  }

  public remove(sessionId: string, key: string): ModelReference {
    const sessionReferences = this._referencesBySessionId.get(sessionId);
    if (sessionReferences !== undefined) {
      const current = sessionReferences.get(key);
      sessionReferences.delete(key);
      return current;
    } else {
      return;
    }
  }

  public removeBySession(sessionId: string): void {
    this._referencesBySessionId.delete(sessionId);
  }

  public removeByKey(key: string): void {
    this._referencesBySessionId.forEach(referencesForSession => {
      referencesForSession.delete(key);
    });
  }
}
