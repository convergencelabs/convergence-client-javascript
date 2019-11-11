import {ObservableElement, ObservableElementEvents} from "./ObservableElement";
export {ObservableElementEventConstants as ObservableNullEventConstants} from "./ObservableElement";

/**
 * @category Real Time Data Subsystem
 */
export interface ObservableNullEvents extends ObservableElementEvents {

}

/**
 * @category Real Time Data Subsystem
 */
export interface ObservableNull extends ObservableElement<void>  {

}
