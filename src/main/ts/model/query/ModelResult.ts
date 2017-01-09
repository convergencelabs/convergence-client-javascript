export class ModelResult {
  constructor(public readonly collectionId: string,
              public readonly modelId: string,
              public readonly created: Date,
              public readonly modified: Date,
              public readonly version: Date) {
    Object.freeze(this);
  }
}
