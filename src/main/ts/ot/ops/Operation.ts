module convergence.ot {
  export abstract class Operation {
    constructor(public type: string) {
    }

    abstract copy(properties: any): Operation;
  }
}
