export class ModelResult {
  constructor(public readonly data: {[key: string]: any},
              public readonly collectionId?: string,
              public readonly modelId?: string,
              public readonly created?: Date,
              public readonly modified?: Date,
              public readonly version?: number) {
    Object.freeze(this);
  }
}
