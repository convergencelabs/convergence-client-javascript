import {RichTextOperation} from "./RichTextOperation";
import {RichTextRange} from "../model";

/**
 * @hidden
 * @internal
 */
export class RichTextSetAttribute implements RichTextOperation {
  private readonly _range: RichTextRange;
  private readonly _key: string;
  private readonly _oldValue: any;
  private readonly _newValue: any;

  constructor(range: RichTextRange, key: string, oldValue: any, newValue: any) {
    this._range = range;
    this._key = key;
    this._newValue = newValue;
    this._oldValue = oldValue;
  }

  public range(): RichTextRange {
    return this._range;
  }

  public key(): string {
    return this._key;
  }

  public oldValue(): any {
    return this._oldValue;
  }

  public newValue(): any {
    return this._newValue;
  }
}
