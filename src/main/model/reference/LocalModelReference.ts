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

import {ModelReference, ModelReferenceEvents} from "./ModelReference";
import {RealTimeElement, RealTimeModel} from "../rt";
import {IConvergenceEvent, ConvergenceEventEmitter} from "../../util";
import {DomainUser} from "../../identity";
import { ReferenceType } from "./ReferenceType";

/**
 * @hidden
 * @internal
 */
export interface ModelReferenceCallbacks {
  onShare: (reference: LocalModelReference<any, any>) => void;
  onUnShare: (reference: LocalModelReference<any, any>) => void;
  onSet: (reference: LocalModelReference<any, any>) => void;
  onClear: (reference: LocalModelReference<any, any>) => void;
}

/**
 * The parent class for a
 * [local reference](https://docs.convergence.io/guide/models/references/local-references.html).
 *
 * @module Collaboration Awareness
 */
export abstract class LocalModelReference<V, R extends ModelReference<V>>
extends ConvergenceEventEmitter<IConvergenceEvent> {

  /**
   * A mapping of the events this model reference could emit to each event's unique name.
   * Use this to refer an event name:
   *
   * ```typescript
   * localReference.on(LocalModelReference.Events.SET, function listener(e) {
   *   // ...
   * })
   * ```
   */
  public static readonly Events: ModelReferenceEvents = ModelReference.Events;

  /**
   * @hidden
   * @internal
   */
  protected _reference: R;

  /**
   * @internal
   */
  private _shared: boolean;

  /**
   * @internal
   */
  private _callbacks: ModelReferenceCallbacks;

  /**
   * @param reference
   * @param callbacks
   *
   * @hidden
   * @internal
   */
  protected constructor(reference: R, callbacks: ModelReferenceCallbacks) {
    super();

    this._emitFrom(reference.events());
    this._reference = reference;
    this._shared = false;
    this._callbacks = callbacks;
  }

  /**
   * Returns a string indicating the type of reference this is.
   */
  public type(): ReferenceType {
    return this._reference.type();
  }

  /**
   * Returns the unique key corresponding to this reference.
   */
  public key(): string {
    return this._reference.key();
  }

  /**
   * Returns the element or model on which this reference was created.
   */
  public source(): RealTimeElement<any> | RealTimeModel {
    return this._reference.source();
  }

  /**
   * Returns true.
   */
  public isLocal(): boolean {
    return true;
  }

  /**
   * Returns the user that created this reference.
   */
  public user(): DomainUser {
    return this._reference.user();
  }

  /**
   * Returns the session ID of the user session that created this reference.
   */
  public sessionId(): string {
    return this._reference.sessionId();
  }

  /**
   * Returns true if this reference has already been disposed (cleaned up).
   */
  public isDisposed(): boolean {
    return this._reference.isDisposed();
  }

  /**
   * Returns the first value of the underlying reference.
   */
  public value(): V {
    return this._reference.value();
  }

  /**
   * Returns all values of the underlying reference.
   */
  public values(): V[] {
    return this._reference.values();
  }

  /**
   * Returns the underlying [[ModelReference]].
   */
  public reference(): R {
    return this._reference;
  }

  /**
   * Publishes the reference, such that other users with access to the attached
   * model can access this reference and its underlying value(s).
   */
  public share(): void {
    this._ensureAttached();
    this._shared = true;
    this._callbacks.onShare(this);
  }

  /**
   * Unpublishes the reference, essentially making it private.
   */
  public unshare(): void {
    this._ensureAttached();
    this._shared = false;
    this._callbacks.onUnShare(this);
  }

  /**
   * Returns true if this reference is currently being shared.
   */
  public isShared(): boolean {
    return this._shared;
  }

  /**
   * Sets one or multiple values on this reference. If the reference is published,
   * it will emit an event do any remote listeners.
   *
   * @param value the new value(s)
   */
  public set(value: V): void;
  public set(value: V[]): void;
  public set(value: V | V[]): void {
    this._ensureAttached();

    if (value instanceof Array) {
      this._reference._set(value, false);
    } else {
      this._reference._set([value], false);
    }

    if (this.isShared()) {
      this._callbacks.onSet(this);
    }
  }

  /**
   * Clears any values on this reference.  This is a way to explictly indicate that the
   * reference currently has no value.
   */
  public clear(): void {
    this._ensureAttached();
    this._reference._clear();
    this._callbacks.onClear(this);
  }

  /**
   * Returns true if a value is currenly set on the reference.
   */
  public isSet(): boolean {
    return this._reference.isSet();
  }

  /**
   * Disposes the reference, unpublishing it beforehand if necessary.
   */
  public dispose(): void {
    this._ensureAttached();
    this.unshare();
    this._reference._dispose();
    this._callbacks = null;
  }

  /**
   * @hidden
   * @internal
   */
  private _ensureAttached(): void {
    if (this.type() !== ModelReference.Types.ELEMENT) {
      if ((this.reference().source() as RealTimeElement).isDetached()) {
        throw new Error("The source model is detached");
      }
    }
  }
}
