/**
 * The IConvergenceEvent is the parent interface of all events fired by
 * Convergence. It ensures that each fired event has a name property that
 * indicates the event that was fired.
 */
export interface IConvergenceEvent {

  /**
   * The name of the event that was fired. Note that the name is only
   * guaranteed to be unique within the class / subsystem that is firing
   * it. Names might be reused across classes and subsystems.
   */
  name: string;
}
