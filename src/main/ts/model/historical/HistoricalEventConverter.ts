import {NodeWrapperFactory} from "../internal/NodeWrapperFactory";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {HistoricalElement} from "./HistoricalElement";
import {NodeChangedEvent} from "../internal/events";
import {HistoricalArray} from "./HistoricalArray";
import {ArrayNodeInsertEvent} from "../internal/events";
import {ArrayNodeRemoveEvent} from "../internal/events";
import {ArrayNodeReorderEvent} from "../internal/events";
import {ArrayNodeSetEvent} from "../internal/events";
import {ArrayNodeSetValueEvent} from "../internal/events";
import {NodeDetachedEvent} from "../internal/events";
import {BooleanNodeSetValueEvent} from "../internal/events";
import {HistoricalBoolean} from "./HistoricalBoolean";
import {NumberNodeSetValueEvent} from "../internal/events";
import {HistoricalNumber} from "./HistoricalNumber";
import {NumberNodeAddEvent} from "../internal/events";
import {ObjectNodeSetValueEvent} from "../internal/events";
import {HistoricalObject} from "./HistoricalObject";
import {ObjectNodeRemoveEvent} from "../internal/events";
import {ObjectNodeSetEvent} from "../internal/events";
import {StringNodeInsertEvent} from "../internal/events";
import {HistoricalString} from "./HistoricalString";
import {StringNodeRemoveEvent} from "../internal/events";
import {StringNodeSetValueEvent} from "../internal/events";
import {ValueDetachedEvent} from "./events";
import {ModelChangedEvent} from "./events";
import {ValueChangedEvent} from "./events";
import {ArrayInsertEvent} from "./events";
import {ArrayRemoveEvent} from "./events";
import {ArrayReorderEvent} from "./events";
import {ArraySetEvent} from "./events";
import {ArraySetValueEvent} from "./events";
import {BooleanSetValueEvent} from "./events";
import {NumberSetValueEvent} from "./events";
import {NumberAddEvent} from "./events";
import {ObjectSetValueEvent} from "./events";
import {ObjectRemoveEvent} from "./events";
import {ObjectSetEvent} from "./events";
import {StringInsertEvent} from "./events";
import {StringRemoveEvent} from "./events";
import {StringSetValueEvent} from "./events";

export class HistoricalEventConverter {

  public static convertEvent(event: ConvergenceEvent, wrapperFactory: NodeWrapperFactory<HistoricalElement<any>>): ConvergenceEvent {
    if (event instanceof  NodeDetachedEvent) {
      return new ValueDetachedEvent(wrapperFactory.wrap(event.src));
    } else if (event instanceof NodeChangedEvent) {
      return new ModelChangedEvent(wrapperFactory.wrap(event.src), event.relativePath,
        <ValueChangedEvent> this.convertEvent(event.childEvent, wrapperFactory), event.sessionId, event.username);
    } else if (event instanceof ArrayNodeInsertEvent) {
      return new ArrayInsertEvent(<HistoricalArray> wrapperFactory.wrap(event.src), event.index,
        wrapperFactory.wrap(event.value), event.sessionId, event.username);
    } else if (event instanceof ArrayNodeRemoveEvent) {
      return new ArrayRemoveEvent(<HistoricalArray> wrapperFactory.wrap(event.src), event.index,
        event.sessionId, event.username);
    } else if (event instanceof ArrayNodeReorderEvent) {
      return new ArrayReorderEvent(<HistoricalArray> wrapperFactory.wrap(event.src), event.fromIndex, event.toIndex,
        event.sessionId, event.username);
    }  else if (event instanceof ArrayNodeSetEvent) {
      return new ArraySetEvent(<HistoricalArray> wrapperFactory.wrap(event.src), event.index, event.value,
        event.sessionId, event.username);
    } else if (event instanceof ArrayNodeSetValueEvent) {
      return new ArraySetValueEvent(<HistoricalArray> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username);
    } else if (event instanceof BooleanNodeSetValueEvent) {
      return new BooleanSetValueEvent(<HistoricalBoolean> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username);
    } else if (event instanceof NumberNodeSetValueEvent) {
      return new NumberSetValueEvent(<HistoricalNumber> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username);
    } else if (event instanceof NumberNodeAddEvent) {
      return new NumberAddEvent(<HistoricalNumber> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username);
    } else if (event instanceof ObjectNodeSetValueEvent) {
      return new ObjectSetValueEvent(<HistoricalObject> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username);
    } else if (event instanceof ObjectNodeRemoveEvent) {
      return new ObjectRemoveEvent(<HistoricalObject> wrapperFactory.wrap(event.src), event.key,
        event.sessionId, event.username);
    } else if (event instanceof ObjectNodeSetEvent) {
      return new ObjectSetEvent(<HistoricalObject> wrapperFactory.wrap(event.src), event.key,
        wrapperFactory.wrap(event.value), event.sessionId, event.username);
    } else if (event instanceof StringNodeInsertEvent) {
      return new StringInsertEvent(<HistoricalString> wrapperFactory.wrap(event.src), event.index, event.value,
        event.sessionId, event.username);
    } else if (event instanceof StringNodeRemoveEvent) {
      return new StringRemoveEvent(<HistoricalString> wrapperFactory.wrap(event.src), event.index, event.value,
        event.sessionId, event.username);
    } else if (event instanceof StringNodeSetValueEvent) {
      return new StringSetValueEvent(<HistoricalString> wrapperFactory.wrap(event.src), event.value,
        event.sessionId, event.username);
    } else {
      throw new Error("Unable to convert event: " + event.name);
    }
  }
}
