import {ICreateModelOptions} from "./ICreateModelOptions";

/**
 * The configuration that is available when creating a model using the
 * [[ModelService.openAutoCreate]] method.
 *
 * @category Real Time Data Subsystem
 */
export interface IAutoCreateModelOptions extends ICreateModelOptions {
  ephemeral?: boolean;
}
