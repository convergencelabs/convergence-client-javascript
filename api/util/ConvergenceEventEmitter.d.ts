import {EventEmitter} from "./EventEmitter";
import {ConvergenceEvent} from "./ConvergenceEvent";
import {Observable} from "rxjs/Rx";

export declare class ConvergenceEventEmitter extends EventEmitter {

  constructor();

  emitEvent(event: ConvergenceEvent): ConvergenceEventEmitter;

  events(): Observable<any>;
}
