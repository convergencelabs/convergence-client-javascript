import {RichTextLocation} from "./RichTextLocation";
import {RichTextOperation} from "../operations/RichTextOperation";
import {RichTextRange} from "./RichTextRange";

/**
 * @internal
 * @hidden
 */
export class RichTextLocationTransformer {

  public static transform(location: RichTextLocation, operation: RichTextOperation): RichTextLocation {
    return null;
  }

  public static transformRemove(location: RichTextLocation, range: RichTextRange): RichTextLocation {
    return location;
  }
}
