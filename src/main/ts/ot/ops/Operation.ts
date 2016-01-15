module convergence.ot {
  export interface Operation {
    copy(properties:any): Operation
    type(): string
  }
}