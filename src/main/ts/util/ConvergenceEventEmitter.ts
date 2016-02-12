import EventEmitter from "./EventEmitter";
import ConvergenceEvent from "./ConvergenceEvent";

export default class ConvergenceEventEmitter extends EventEmitter {
  emitEvent(event: ConvergenceEvent): EventEmitter {
    Object.freeze(event);
    return this.emit(event.name, event);
  }
}
