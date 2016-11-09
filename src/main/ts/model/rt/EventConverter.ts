import {NodeWrapperFactory} from "../internal/NodeWrapperFactory";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {RealTimeElement} from "./RealTimeElement";
import {NodeChangedEvent} from "../internal/events";
import {RealTimeArray} from "./RealTimeArray";
import {ArrayNodeInsertEvent} from "../internal/events";
import {ArrayNodeRemoveEvent} from "../internal/events";
import {ArrayNodeReorderEvent} from "../internal/events";
import {ArrayNodeSetEvent} from "../internal/events";
import {ArrayNodeSetValueEvent} from "../internal/events";
import {NodeDetachedEvent} from "../internal/events";
import {BooleanNodeSetValueEvent} from "../internal/events";
import {RealTimeBoolean} from "./RealTimeBoolean";
import {NumberNodeSetValueEvent} from "../internal/events";
import {RealTimeNumber} from "./RealTimeNumber";
import {NumberNodeDeltaEvent} from "../internal/events";
import {ObjectNodeSetValueEvent} from "../internal/events";
import {RealTimeObject} from "./RealTimeObject";
import {ObjectNodeRemoveEvent} from "../internal/events";
import {ObjectNodeSetEvent} from "../internal/events";
import {StringNodeInsertEvent} from "../internal/events";
import {RealTimeString} from "./RealTimeString";
import {StringNodeRemoveEvent} from "../internal/events";
import {StringNodeSetValueEvent} from "../internal/events";
import {ElementDetachedEvent} from "./events";
import {ModelChangedEvent} from "./events";
import {ValueChangedEvent} from "./events";
import {ArrayInsertEvent} from "./events";
import {ArrayRemoveEvent} from "./events";
import {ArrayReorderEvent} from "./events";
import {ArraySetEvent} from "./events";
import {ArraySetValueEvent} from "./events";
import {BooleanSetValueEvent} from "./events";
import {NumberSetValueEvent} from "./events";
import {NumberDeltaEvent} from "./events";
import {ObjectSetValueEvent} from "./events";
import {ObjectRemoveEvent} from "./events";
import {ObjectSetEvent} from "./events";
import {StringInsertEvent} from "./events";
import {StringRemoveEvent} from "./events";
import {StringSetValueEvent} from "./events";

export class EventConverter {

  public static convertEvent(event: ConvergenceEvent,
                             wrapperFactory: NodeWrapperFactory<RealTimeElement<any>>): ConvergenceEvent {
    if (event instanceof NodeDetachedEvent) {
      return new ElementDetachedEvent(wrapperFactory.wrap(event.src));
    } else if (event instanceof NodeChangedEvent) {
      return new ModelChangedEvent(wrapperFactory.wrap(event.src), event.relativePath,
        <ValueChangedEvent> this.convertEvent(event.childEvent, wrapperFactory),
        event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeInsertEvent) {
      return new ArrayInsertEvent(<RealTimeArray> wrapperFactory.wrap(event.src), event.index,
        wrapperFactory.wrap(event.value), event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeRemoveEvent) {
      return new ArrayRemoveEvent(<RealTimeArray> wrapperFactory.wrap(event.src), event.index,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeReorderEvent) {
      return new ArrayReorderEvent(<RealTimeArray> wrapperFactory.wrap(event.src), event.fromIndex, event.toIndex,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeSetEvent) {
      return new ArraySetEvent(<RealTimeArray> wrapperFactory.wrap(event.src), event.index, event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ArrayNodeSetValueEvent) {
      return new ArraySetValueEvent(<RealTimeArray> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof BooleanNodeSetValueEvent) {
      return new BooleanSetValueEvent(<RealTimeBoolean> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof NumberNodeSetValueEvent) {
      return new NumberSetValueEvent(<RealTimeNumber> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof NumberNodeDeltaEvent) {
      return new NumberDeltaEvent(<RealTimeNumber> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ObjectNodeSetValueEvent) {
      return new ObjectSetValueEvent(<RealTimeObject> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ObjectNodeRemoveEvent) {
      return new ObjectRemoveEvent(<RealTimeObject> wrapperFactory.wrap(event.src), event.key,
        event.sessionId, event.username, event.local);
    } else if (event instanceof ObjectNodeSetEvent) {
      return new ObjectSetEvent(<RealTimeObject> wrapperFactory.wrap(event.src), event.key,
        wrapperFactory.wrap(event.value), event.sessionId, event.username, event.local);
    } else if (event instanceof StringNodeInsertEvent) {
      return new StringInsertEvent(<RealTimeString> wrapperFactory.wrap(event.src), event.index, event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof StringNodeRemoveEvent) {
      return new StringRemoveEvent(<RealTimeString> wrapperFactory.wrap(event.src), event.index, event.value,
        event.sessionId, event.username, event.local);
    } else if (event instanceof StringNodeSetValueEvent) {
      return new StringSetValueEvent(<RealTimeString> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username, event.local);
    } else {
      throw new Error("Unable to convert event: " + event.name);
    }
  }
}
