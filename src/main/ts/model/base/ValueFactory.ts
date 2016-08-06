import {DataValue} from "../dataValue";
import {ConvergenceContainerValue} from "./ConvergenceContainerValue";
import {PathElement} from "../ot/Path";
import {ConvergenceValue} from "./ConvergenceValue";

export interface ValueFactory {
  create(data: DataValue, parent: ConvergenceContainerValue<any>, fieldInParent: PathElement): ConvergenceValue<any>;
}
