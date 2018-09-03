import {ConvergenceEvent} from "../util/";
import {NodeWrapperFactory} from "./internal/NodeWrapperFactory";
import {ObservableBoolean} from "./observable/ObservableBoolean";
import {ObservableNumber} from "./observable/ObservableNumber";
import {ObservableObject} from "./observable/ObservableObject";
import {ObservableString} from "./observable/ObservableString";
import {ObservableElement} from "./observable/ObservableElement";
import {ObservableArray} from "./observable/ObservableArray";
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
  ElementDetachedEvent,
  DateSetValueEvent,
  ModelChangedEvent,
  ValueChangedEvent,
  ArrayInsertEvent,
  ArrayRemoveEvent,
  ArrayReorderEvent,
  ArraySetEvent,
  ArraySetValueEvent,
  BooleanSetValueEvent,
  NumberSetValueEvent,
  NumberDeltaEvent,
  ObjectSetValueEvent,
  ObjectRemoveEvent,
  ObjectSetEvent,
  StringInsertEvent,
  StringRemoveEvent,
  StringSetValueEvent
} from "./modelEvents";
import {ObservableDate} from "./observable/ObservableDate";

/**
 * @hidden
 * @internal
 */
export class ModelEventConverter {

  public static convertEvent(event: ConvergenceEvent,
                             wrapperFactory: NodeWrapperFactory<ObservableElement<any>>): ConvergenceEvent {
    if (event instanceof NodeDetachedEvent) {
      return new ElementDetachedEvent(wrapperFactory.wrap(event.src));
    } else if (event instanceof NodeChangedEvent) {
      return new ModelChangedEvent(wrapperFactory.wrap(event.src), event.relativePath,
        this.convertEvent(event.childEvent, wrapperFactory) as ValueChangedEvent,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeInsertEvent) {
      return new ArrayInsertEvent(wrapperFactory.wrap(event.src) as ObservableArray, event.index,
        wrapperFactory.wrap(event.value), event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeRemoveEvent) {
      return new ArrayRemoveEvent(
        wrapperFactory.wrap(event.src) as ObservableArray,
        event.index,
        wrapperFactory.wrap(event.oldValue),
        event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeReorderEvent) {
      return new ArrayReorderEvent(wrapperFactory.wrap(event.src) as ObservableArray, event.fromIndex, event.toIndex,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeSetEvent) {
      return new ArraySetEvent(
        wrapperFactory.wrap(event.src) as ObservableArray,
        event.index,
        wrapperFactory.wrap(event.value),
        wrapperFactory.wrap(event.oldValue),
        event.sessionId,
        event.username,
        event.local);
    } else if (event instanceof ArrayNodeSetValueEvent) {
      return new ArraySetValueEvent(wrapperFactory.wrap(event.src) as ObservableArray,
        event.sessionId, event.username, event.local);
    } else if (event instanceof BooleanNodeSetValueEvent) {
      return new BooleanSetValueEvent(wrapperFactory.wrap(event.src) as ObservableBoolean,
        event.sessionId, event.username, event.local);
    } else if (event instanceof NumberNodeSetValueEvent) {
      return new NumberSetValueEvent(wrapperFactory.wrap(event.src) as ObservableNumber,
        event.sessionId, event.username, event.local);
    } else if (event instanceof NumberNodeDeltaEvent) {
      return new NumberDeltaEvent(wrapperFactory.wrap(event.src) as ObservableNumber, event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ObjectNodeSetValueEvent) {
      return new ObjectSetValueEvent(wrapperFactory.wrap(event.src) as ObservableObject,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ObjectNodeRemoveEvent) {
      return new ObjectRemoveEvent(
        wrapperFactory.wrap(event.src) as ObservableObject,
        event.key,
        wrapperFactory.wrap(event.oldValue),
        event.sessionId, event.username, event.local);
    } else if (event instanceof ObjectNodeSetEvent) {
      return new ObjectSetEvent(
        wrapperFactory.wrap(event.src) as ObservableObject,
        event.key,
        wrapperFactory.wrap(event.value),
        wrapperFactory.wrap(event.oldValue),
        event.sessionId,
        event.username, event.local);
    } else if (event instanceof StringNodeInsertEvent) {
      return new StringInsertEvent(wrapperFactory.wrap(event.src) as ObservableString, event.index, event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof StringNodeRemoveEvent) {
      return new StringRemoveEvent(wrapperFactory.wrap(event.src) as ObservableString, event.index, event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof StringNodeSetValueEvent) {
      return new StringSetValueEvent(wrapperFactory.wrap(event.src) as ObservableString,
        event.sessionId, event.username, event.local);
    } else if (event instanceof DateNodeSetValueEvent) {
      return new DateSetValueEvent(wrapperFactory.wrap(event.src) as ObservableDate,
        event.sessionId, event.username, event.local);
    } else {
      throw new Error("Unable to convert event: " + event.name);
    }
  }
}
