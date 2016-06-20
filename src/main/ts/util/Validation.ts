export class Validation {
  static nonEmptyString(value: string): boolean {
    return typeof value === "string" && value.length > 0;
  }
}
