import {NodeWrapperFactory} from "../internal/NodeWrapperFactory";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ModelChangedEvent} from "../observable/ObservableValue";
import {RealTimeValue} from "./RealTimeValue";
import {NodeChangedEvent} from "../internal/events";
import {RealTimeArray} from "./RealTimeArray";
import {ArrayInsertEvent} from "./RealTimeArray";
import {ArrayNodeInsertEvent} from "../internal/events";
import {ArrayNodeRemoveEvent} from "../internal/events";
import {ArrayRemoveEvent} from "./RealTimeArray";
import {ArrayNodeReorderEvent} from "../internal/events";
import {ArrayReorderEvent} from "./RealTimeArray";
import {ArrayNodeSetEvent} from "../internal/events";
import {ArraySetEvent} from "./RealTimeArray";
import {ArrayNodeSetValueEvent} from "../internal/events";
import {ArraySetValueEvent} from "../observable/ObservableArray";
import {ModelNodeEvent} from "../internal/events";
import {NodeDetachedEvent} from "../internal/events";
import {BooleanNodeSetValueEvent} from "../internal/events";
import {RealTimeBoolean} from "./RealTimeBoolean";
import {BooleanSetValueEvent} from "./RealTimeBoolean";
import {NumberNodeSetValueEvent} from "../internal/events";
import {NumberSetValueEvent} from "./RealTimeNumber";
import {RealTimeNumber} from "./RealTimeNumber";
import {NumberNodeAddEvent} from "../internal/events";
import {NumberAddEvent} from "./RealTimeNumber";
import {ObjectNodeSetValueEvent} from "../internal/events";
import {ObjectSetValueEvent} from "./RealTimeObject";
import {RealTimeObject} from "./RealTimeObject";
import {ObjectNodeRemoveEvent} from "../internal/events";
import {ObjectRemoveEvent} from "./RealTimeObject";
import {ObjectNodeSetEvent} from "../internal/events";
import {ObjectSetEvent} from "./RealTimeObject";
import {StringNodeInsertEvent} from "../internal/events";
import {StringInsertEvent} from "./RealTimeString";
import {RealTimeString} from "./RealTimeString";
import {StringNodeRemoveEvent} from "../internal/events";
import {StringRemoveEvent} from "./RealTimeString";
import {StringNodeSetValueEvent} from "../internal/events";
import {StringSetValueEvent} from "./RealTimeString";

export class EventConverter {

  public static convertEvent(event: ModelNodeEvent, wrapperFactory: NodeWrapperFactory<RealTimeValue<any>>): ConvergenceEvent {
    if (event instanceof  NodeDetachedEvent) {
      return <ModelChangedEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeValue.Events.DETACHED
      };
    } else if (event instanceof NodeChangedEvent) {
      return <ModelChangedEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeValue.Events.MODEL_CHANGED,
        relativePath: event.relativePath,
        childEvent: this.convertEvent(event.childEvent, wrapperFactory)
      };
    } else if (event instanceof ArrayNodeInsertEvent) {
      return <ArrayInsertEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeArray.Events.INSERT,
        sessionId: event.sessionId,
        username: event.username,
        index: event.index,
        value: wrapperFactory.wrap(event.value)
      };
    } else if (event instanceof ArrayNodeRemoveEvent) {
      return <ArrayRemoveEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeArray.Events.REMOVE,
        sessionId: event.sessionId,
        username: event.username,
        index: event.index
      };
    } else if (event instanceof ArrayNodeReorderEvent) {
      return <ArrayReorderEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeArray.Events.REORDER,
        sessionId: event.sessionId,
        username: event.username,
        fromIndex: event.fromIndex,
        toIndex: event.toIndex
      };
    }  else if (event instanceof ArrayNodeSetEvent) {
      return <ArraySetEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeArray.Events.SET,
        sessionId: event.sessionId,
        username: event.username,
        index: event.index,
        value: event.value
      };
    } else if (event instanceof ArrayNodeSetValueEvent) {
      return <ArraySetValueEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeArray.Events.VALUE,
        sessionId: event.sessionId,
        username: event.username,
        value: event.value
      };
    } else if (event instanceof BooleanNodeSetValueEvent) {
      return <BooleanSetValueEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeBoolean.Events.VALUE,
        sessionId: event.sessionId,
        username: event.username,
        value: event.value
      };
    } else if (event instanceof NumberNodeSetValueEvent) {
      return <NumberSetValueEvent> {
        name: RealTimeNumber.Events.VALUE,
        src: wrapperFactory.wrap(event.src),
        sessionId: event.sessionId,
        username: event.username,
        value: event.value
      };
    } else if (event instanceof NumberNodeAddEvent) {
      return <NumberAddEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeNumber.Events.ADD,
        sessionId: event.sessionId,
        username: event.username,
        value: event.value
      };
    } else if (event instanceof ObjectNodeSetValueEvent) {
      return <ObjectSetValueEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeObject.Events.VALUE,
        sessionId: event.sessionId,
        username: event.username
      };
    } else if (event instanceof ObjectNodeRemoveEvent) {
      return <ObjectRemoveEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeObject.Events.REMOVE,
        sessionId: event.sessionId,
        username: event.username,
        key: event.key
      };
    } else if (event instanceof ObjectNodeSetEvent) {
      return <ObjectSetEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeObject.Events.REMOVE,
        sessionId: event.sessionId,
        username: event.username,
        key: event.key,
        value: wrapperFactory.wrap(event.value)
      };
    } else if (event instanceof StringNodeInsertEvent) {
      return <StringInsertEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeString.Events.INSERT,
        sessionId: event.sessionId,
        username: event.username,
        index: event.index,
        value: event.value
      };
    } else if (event instanceof StringNodeRemoveEvent) {
      return <StringRemoveEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeString.Events.REMOVE,
        sessionId: event.sessionId,
        username: event.username,
        index: event.index,
        value: event.value
      };
    } else if (event instanceof StringNodeSetValueEvent) {
      return <StringSetValueEvent> {
        src: wrapperFactory.wrap(event.src),
        name: RealTimeString.Events.VALUE,
        sessionId: event.sessionId,
        username: event.username,
        value: event.value
      };
    } else {
      throw new Error("Unable to convert event: " + event.name);
    }
  }
}
