import {IConvergenceEvent} from "../../util";
import {ObservableModel} from "../observable/ObservableModel";

export interface IModelEvent extends IConvergenceEvent {
  readonly src: ObservableModel;
}
