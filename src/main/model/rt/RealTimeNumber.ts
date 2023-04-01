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

import {RealTimeElement} from "./RealTimeElement";
import {NumberNode} from "../internal/NumberNode";
import {NumberSetOperation} from "../ot/ops/NumberSetOperation";
import {RealTimeModel} from "./RealTimeModel";
import {ModelNodeEvent, NumberNodeSetValueEvent, NumberNodeDeltaEvent} from "../internal/events";
import {ModelEventCallbacks} from "../internal/ModelEventCallbacks";
import {NumberDeltaOperation} from "../ot/ops/NumberDeltaOperation";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ObservableNumber, ObservableNumberEvents, ObservableNumberEventConstants} from "../observable/ObservableNumber";
import {RemoteReferenceEvent} from "../reference/RemoteReferenceEvent";
import {IdentityCache} from "../../identity/IdentityCache";

/**
 * @module Real Time Data
 */
export interface RealTimeNumberEvents extends ObservableNumberEvents {
}

/**
 * This is a distributed number that wraps a native javascript `number`.  It provides
 * a few convenience functions for doing arithmetic and incrementing/decrementing.
 *
 * See [[RealTimeNumberEvents]] for the events that can be emitted on remote
 * changes to this object.
 *
 * See the
 * [developer guide](https://guide.convergence.io/models/data/real-time-number.html)
 * for the most common use cases.
 *
 * @module Real Time Data
 */
export class RealTimeNumber extends RealTimeElement<number> implements ObservableNumber {

  /**
   * A mapping of the events this array could emit to each event's unique name.
   * Use this to refer an event name, e.g.
   *
   * ```typescript
   * rtNum.on(RealTimeNumber.Events.DELTA, function listener(e) {
   *   // ...
   * })
   * ```
   */
  public static readonly Events: RealTimeNumberEvents = ObservableNumberEventConstants;

  /**
   * Constructs a new RealTimeNumber.
   *
   * @hidden
   * @internal
   */
  constructor(delegate: NumberNode,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              identityCache: IdentityCache) {
    super(delegate, callbacks, wrapperFactory, model, [], identityCache);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof NumberNodeSetValueEvent) {
          this._sendOperation(new NumberSetOperation(this.id(), false, event.value));
        } else if (event instanceof NumberNodeDeltaEvent) {
          this._sendOperation(new NumberDeltaOperation(this.id(), false, event.value));
        }
      }
    });
  }

  /**
   * Adds the given number to this object's underlying number.
   *
   * ```typescript
   * rtNumber.value() // 13
   * rtNumber.add(4)
   * rtNumber.value() // 17
   * ```
   *
   * On a successful `add`, a [[NumberDeltaEvent]] will be emitted for any remote users.
   *
   * @param value the addend to be added
   */
  public add(value: number): void {
    this._assertWritable();
    (this._delegate as NumberNode).add(value);
  }

  /**
   * Subtracts the given number from this object's underlying number.
   *
   * ```typescript
   * rtNumber.value() // 13
   * rtNumber.subtract(4)
   * rtNumber.value() // 9
   * ```
   *
   * On a successful `subtract`, a [[NumberDeltaEvent]] will be emitted for any remote users.
   *
   * @param value the subtrahend to be subtracted
   */
  public subtract(value: number): void {
    this._assertWritable();
    (this._delegate as NumberNode).subtract(value);
  }

  /**
   * Increments the underlying number by 1.  Equivalent to `add(1)`
   *
   * ```typescript
   * rtNumber.value() // 13
   * rtNumber.increment()
   * rtNumber.value() // 14
   * ```
   *
   * On a successful `increment`, a [[NumberDeltaEvent]] will be emitted for any remote users.
   */
  public increment(): void {
    this._assertWritable();
    (this._delegate as NumberNode).increment();
  }

  /**
   * Decrements the underlying number by 1.  Equivalent to `subtract(1)`
   *
   * ```typescript
   * rtNumber.value() // 13
   * rtNumber.decrement()
   * rtNumber.value() // 12
   * ```
   *
   * On a successful `decrement`, a [[NumberDeltaEvent]] will be emitted for any remote users.
   */
  public decrement(): void {
    this._assertWritable();
    (this._delegate as NumberNode).decrement();
  }

  /**
   * @param event
   *
   * @private
   * @hidden
   * @internal
   */
  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Number values do not process references");
  }
}
