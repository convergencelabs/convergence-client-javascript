import {ICreateModelOptions} from "./ICreateModelOptions";

/**
 * The configuration that is available when creating a model using the
 * [[ModelService.openAutoCreate]] method.
 *
 * @module Real Time Data
 */
export interface IAutoCreateModelOptions extends ICreateModelOptions {
  ephemeral?: boolean;
}
