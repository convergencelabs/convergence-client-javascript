export default abstract class Operation {
  constructor(public type: string) {
  }

  abstract copy(properties: any): Operation;
}