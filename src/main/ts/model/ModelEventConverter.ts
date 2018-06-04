import {NodeWrapperFactory} from "./internal/NodeWrapperFactory";
import {ConvergenceEvent} from "../util/";
import {ObservableElement} from "./observable/ObservableElement";
import {NodeChangedEvent, DateNodeSetValueEvent} from "./internal/events";
import {ObservableArray} from "./observable/ObservableArray";
import {ArrayNodeInsertEvent} from "./internal/events";
import {ArrayNodeRemoveEvent} from "./internal/events";
import {ArrayNodeReorderEvent} from "./internal/events";
import {ArrayNodeSetEvent} from "./internal/events";
import {ArrayNodeSetValueEvent} from "./internal/events";
import {NodeDetachedEvent} from "./internal/events";
import {BooleanNodeSetValueEvent} from "./internal/events";
import {ObservableBoolean} from "./observable/ObservableBoolean";
import {NumberNodeSetValueEvent} from "./internal/events";
import {ObservableNumber} from "./observable/ObservableNumber";
import {NumberNodeDeltaEvent} from "./internal/events";
import {ObjectNodeSetValueEvent} from "./internal/events";
import {ObservableObject} from "./observable/ObservableObject";
import {ObjectNodeRemoveEvent} from "./internal/events";
import {ObjectNodeSetEvent} from "./internal/events";
import {StringNodeInsertEvent} from "./internal/events";
import {ObservableString} from "./observable/ObservableString";
import {StringNodeRemoveEvent} from "./internal/events";
import {StringNodeSetValueEvent} from "./internal/events";
import {ElementDetachedEvent, DateSetValueEvent} from "./modelEvents";
import {ModelChangedEvent} from "./modelEvents";
import {ValueChangedEvent} from "./modelEvents";
import {ArrayInsertEvent} from "./modelEvents";
import {ArrayRemoveEvent} from "./modelEvents";
import {ArrayReorderEvent} from "./modelEvents";
import {ArraySetEvent} from "./modelEvents";
import {ArraySetValueEvent} from "./modelEvents";
import {BooleanSetValueEvent} from "./modelEvents";
import {NumberSetValueEvent} from "./modelEvents";
import {NumberDeltaEvent} from "./modelEvents";
import {ObjectSetValueEvent} from "./modelEvents";
import {ObjectRemoveEvent} from "./modelEvents";
import {ObjectSetEvent} from "./modelEvents";
import {StringInsertEvent} from "./modelEvents";
import {StringRemoveEvent} from "./modelEvents";
import {StringSetValueEvent} from "./modelEvents";
import {ObservableDate} from "./observable/ObservableDate";

export class ModelEventConverter {

  public static convertEvent(event: ConvergenceEvent,
                             wrapperFactory: NodeWrapperFactory<ObservableElement<any>>): ConvergenceEvent {
    if (event instanceof NodeDetachedEvent) {
      return new ElementDetachedEvent(wrapperFactory.wrap(event.src));
    } else if (event instanceof NodeChangedEvent) {
      return new ModelChangedEvent(wrapperFactory.wrap(event.src), event.relativePath,
        <ValueChangedEvent> this.convertEvent(event.childEvent, wrapperFactory),
        event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeInsertEvent) {
      return new ArrayInsertEvent(<ObservableArray> wrapperFactory.wrap(event.src), event.index,
        wrapperFactory.wrap(event.value), event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeRemoveEvent) {
      return new ArrayRemoveEvent(
        <ObservableArray> wrapperFactory.wrap(event.src),
        event.index,
        wrapperFactory.wrap(event.oldValue),
        event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeReorderEvent) {
      return new ArrayReorderEvent(<ObservableArray> wrapperFactory.wrap(event.src), event.fromIndex, event.toIndex,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeSetEvent) {
      return new ArraySetEvent(
        <ObservableArray> wrapperFactory.wrap(event.src),
        event.index,
        wrapperFactory.wrap(event.value),
        wrapperFactory.wrap(event.oldValue),
        event.sessionId,
        event.username,
        event.local);
    } else if (event instanceof ArrayNodeSetValueEvent) {
      return new ArraySetValueEvent(<ObservableArray> wrapperFactory.wrap(event.src),
        event.sessionId, event.username, event.local);
    } else if (event instanceof BooleanNodeSetValueEvent) {
      return new BooleanSetValueEvent(<ObservableBoolean> wrapperFactory.wrap(event.src),
        event.sessionId, event.username, event.local);
    } else if (event instanceof NumberNodeSetValueEvent) {
      return new NumberSetValueEvent(<ObservableNumber> wrapperFactory.wrap(event.src),
        event.sessionId, event.username, event.local);
    } else if (event instanceof NumberNodeDeltaEvent) {
      return new NumberDeltaEvent(<ObservableNumber> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ObjectNodeSetValueEvent) {
      return new ObjectSetValueEvent(<ObservableObject> wrapperFactory.wrap(event.src),
        event.sessionId, event.username, event.local);
    } else if (event instanceof ObjectNodeRemoveEvent) {
      return new ObjectRemoveEvent(
        <ObservableObject> wrapperFactory.wrap(event.src),
        event.key,
        wrapperFactory.wrap(event.oldValue),
        event.sessionId, event.username, event.local);
    } else if (event instanceof ObjectNodeSetEvent) {
      return new ObjectSetEvent(
        <ObservableObject> wrapperFactory.wrap(event.src),
        event.key,
        wrapperFactory.wrap(event.value),
        wrapperFactory.wrap(event.oldValue),
        event.sessionId,
        event.username, event.local);
    } else if (event instanceof StringNodeInsertEvent) {
      return new StringInsertEvent(<ObservableString> wrapperFactory.wrap(event.src), event.index, event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof StringNodeRemoveEvent) {
      return new StringRemoveEvent(<ObservableString> wrapperFactory.wrap(event.src), event.index, event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof StringNodeSetValueEvent) {
      return new StringSetValueEvent(<ObservableString> wrapperFactory.wrap(event.src),
        event.sessionId, event.username, event.local);
    } else if (event instanceof DateNodeSetValueEvent) {
      return new DateSetValueEvent(<ObservableDate> wrapperFactory.wrap(event.src),
        event.sessionId, event.username, event.local);
    } else {
      throw new Error("Unable to convert event: " + event.name);
    }
  }
}
