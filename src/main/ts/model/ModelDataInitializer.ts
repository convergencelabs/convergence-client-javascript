/**
 * A callback function that will result in some model data that will become the
 * model's initial contents.
 *
 * @module Real Time Data
 */
export type ModelDataCallback = () => ModelData;

/**
 * Some JSON-like model data that will become the new model's initial contents.
 *
 * @module Real Time Data
 */
export interface ModelData {
  [key: string]: any;
}

/**
 * Either some data or a callback returning data can be provided.
 *
 * @module Real Time Data
 */
export type ModelDataInitializer = ModelData | ModelDataCallback;
