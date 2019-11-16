/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {IConvergenceEvent} from "../util";
import {NodeWrapperFactory} from "./internal/NodeWrapperFactory";
import {ObservableBoolean} from "./observable/ObservableBoolean";
import {ObservableNumber} from "./observable/ObservableNumber";
import {ObservableObject} from "./observable/ObservableObject";
import {ObservableString} from "./observable/ObservableString";
import {ObservableElement} from "./observable/ObservableElement";
import {ObservableArray} from "./observable/ObservableArray";
import {ObservableDate} from "./observable/ObservableDate";
import {
  ArrayNodeInsertEvent,
  ArrayNodeRemoveEvent,
  ArrayNodeReorderEvent,
  ArrayNodeSetEvent,
  ArrayNodeSetValueEvent,
  DateNodeSetValueEvent,
  NodeDetachedEvent,
  BooleanNodeSetValueEvent,
  NodeChangedEvent,
  NumberNodeDeltaEvent,
  NumberNodeSetValueEvent,
  ObjectNodeSetValueEvent,
  ObjectNodeRemoveEvent,
  ObjectNodeSetEvent,
  StringNodeInsertEvent,
  StringNodeRemoveEvent,
  StringNodeSetValueEvent
} from "./internal/events";
import {
  IValueChangedEvent,
  ModelChangedEvent,
  ArrayInsertEvent,
  ArrayRemoveEvent,
  ArraySetEvent,
  ArrayReorderEvent,
  ArraySetValueEvent,
  BooleanSetValueEvent,
  DateSetValueEvent,
  NumberSetValueEvent,
  NumberDeltaEvent,
  ObjectSetEvent,
  ObjectRemoveEvent,
  ObjectSetValueEvent,
  StringInsertEvent,
  StringRemoveEvent,
  StringSetValueEvent,
  ElementDetachedEvent
} from "./events";

/**
 * @hidden
 * @internal
 */
export class ModelEventConverter {

  public static convertEvent(event: IConvergenceEvent,
                             wrapperFactory: NodeWrapperFactory<ObservableElement<any>>): IConvergenceEvent {
    if (event instanceof NodeDetachedEvent) {
      return new ElementDetachedEvent(wrapperFactory.wrap(event.src));
    } else if (event instanceof NodeChangedEvent) {
      return new ModelChangedEvent(wrapperFactory.wrap(event.src), event.user, event.sessionId, event.local,
        event.relativePath, this.convertEvent(event.childEvent, wrapperFactory) as IValueChangedEvent);
    } else if (event instanceof ArrayNodeInsertEvent) {
      return new ArrayInsertEvent(
        wrapperFactory.wrap(event.src) as ObservableArray,
        event.user, event.sessionId, event.local,
        event.index,
        wrapperFactory.wrap(event.value));
    } else if (event instanceof ArrayNodeRemoveEvent) {
      return new ArrayRemoveEvent(
        wrapperFactory.wrap(event.src) as ObservableArray,
        event.user, event.sessionId, event.local,
        event.index,
        wrapperFactory.wrap(event.oldValue));
    } else if (event instanceof ArrayNodeReorderEvent) {
      return new ArrayReorderEvent(
        wrapperFactory.wrap(event.src) as ObservableArray,
        event.user, event.sessionId, event.local,
        event.fromIndex, event.toIndex);
    } else if (event instanceof ArrayNodeSetEvent) {
      return new ArraySetEvent(
        wrapperFactory.wrap(event.src) as ObservableArray,
        event.user, event.sessionId, event.local,
        event.index,
        wrapperFactory.wrap(event.value),
        wrapperFactory.wrap(event.oldValue));
    } else if (event instanceof ArrayNodeSetValueEvent) {
      return new ArraySetValueEvent(
        wrapperFactory.wrap(event.src) as ObservableArray,
        event.user, event.sessionId, event.local);
    } else if (event instanceof BooleanNodeSetValueEvent) {
      return new BooleanSetValueEvent(
        wrapperFactory.wrap(event.src) as ObservableBoolean,
        event.user, event.sessionId, event.local);
    } else if (event instanceof NumberNodeSetValueEvent) {
      return new NumberSetValueEvent(
        wrapperFactory.wrap(event.src) as ObservableNumber,
        event.user, event.sessionId, event.local);
    } else if (event instanceof NumberNodeDeltaEvent) {
      return new NumberDeltaEvent(
        wrapperFactory.wrap(event.src) as ObservableNumber,
        event.user, event.sessionId, event.local,
        event.value);
    } else if (event instanceof ObjectNodeSetValueEvent) {
      return new ObjectSetValueEvent(
        wrapperFactory.wrap(event.src) as ObservableObject,
        event.user, event.sessionId, event.local);
    } else if (event instanceof ObjectNodeRemoveEvent) {
      return new ObjectRemoveEvent(
        wrapperFactory.wrap(event.src) as ObservableObject,
        event.user, event.sessionId, event.local,
        event.key,
        wrapperFactory.wrap(event.oldValue));
    } else if (event instanceof ObjectNodeSetEvent) {
      return new ObjectSetEvent(
        wrapperFactory.wrap(event.src) as ObservableObject,
        event.user, event.sessionId, event.local,
        event.key,
        wrapperFactory.wrap(event.value),
        wrapperFactory.wrap(event.oldValue));
    } else if (event instanceof StringNodeInsertEvent) {
      return new StringInsertEvent(
        wrapperFactory.wrap(event.src) as ObservableString,
        event.user, event.sessionId, event.local,
        event.index,
        event.value);
    } else if (event instanceof StringNodeRemoveEvent) {
      return new StringRemoveEvent(
        wrapperFactory.wrap(event.src) as ObservableString,
        event.user, event.sessionId, event.local,
        event.index, event.value);
    } else if (event instanceof StringNodeSetValueEvent) {
      return new StringSetValueEvent(
        wrapperFactory.wrap(event.src) as ObservableString,
        event.user, event.sessionId, event.local);
    } else if (event instanceof DateNodeSetValueEvent) {
      return new DateSetValueEvent(
        wrapperFactory.wrap(event.src) as ObservableDate,
        event.user, event.sessionId, event.local);
    } else {
      throw new Error("Unable to convert event: " + event.name);
    }
  }
}
