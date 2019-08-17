export type ModelDataCallback = () => ModelData;
export interface ModelData {
  [key: string]: any;
}
export type ModelDataInitializer = ModelData | ModelDataCallback;
