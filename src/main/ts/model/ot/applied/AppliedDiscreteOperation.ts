import {AppliedOperation} from "./AppliedOperation";
import {DiscreteChange} from "../ops/operationChanges";

export abstract class AppliedDiscreteOperation extends AppliedOperation implements DiscreteChange {
  constructor(type: string, public id: string, public noOp: boolean) {
    super(type);
  }
}
