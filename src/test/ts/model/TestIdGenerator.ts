export class TestIdGenerator {
  private _id: number = 0;

  public id(): string {
    return "" + this._id++;
  }
}
