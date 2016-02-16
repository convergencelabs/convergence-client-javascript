import DiscreteOperation from "./ot/ops/DiscreteOperation";

export default class ModelOperationEvent {
  /**
   * Constructs a new ModelOperationEvent.
   */
  constructor(public sessionId: string,
              public username: string,
              public version: number,
              public timestamp: number,
              public operation: DiscreteOperation) {

    Object.freeze(this);
  }
}
