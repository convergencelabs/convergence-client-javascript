export type ModelDataCallback = () => { [key: string]: any };
export interface ModelData {
  [key: string]: any;
}
export type ModelDataInitializer = ModelData | ModelDataCallback;
