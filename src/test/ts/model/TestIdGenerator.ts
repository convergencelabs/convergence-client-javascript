export class TestIdGenerator {
  private _id: number = 0;

  id(): string {
    return "" + this._id++;
  }
}
