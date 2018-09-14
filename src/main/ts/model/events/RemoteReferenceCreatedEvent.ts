import {IConvergenceEvent} from "../../util";
import {ModelReference} from "../reference";
import {RealTimeElement, RealTimeModel} from "../rt";

/**
 * The [[RemoteReferenceCreatedEvent]] is fired by an [[ObservableModel]] when
 * a remote reference is created.
 */
export class RemoteReferenceCreatedEvent implements IConvergenceEvent {
  public static readonly NAME = "reference";
  public readonly name: string = RemoteReferenceCreatedEvent.NAME;

  /**
   * @param reference
   * @param element
   * @param model
   *
   * @hidden
   * @internal
   */
  constructor(public readonly reference: ModelReference<any>,
              public readonly model: RealTimeModel,
              public readonly element?: RealTimeElement<any>) {
    Object.freeze(this);
  }
}
