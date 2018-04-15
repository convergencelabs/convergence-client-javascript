import {ObservableElement, ObservableElementEvents, ObservableElementEventConstants} from "./ObservableElement";

export interface ObservableQuillRichTextEvents extends ObservableElementEvents {
  readonly DELTA: string;
}

export const ObservableQuillRichTextEventConstants: ObservableQuillRichTextEvents = Object.assign({
    DELTA: "delta"
  },
  ObservableElementEventConstants
);
Object.freeze(ObservableQuillRichTextEventConstants);

export interface ObservableQuillRichText extends ObservableElement<string> {
  getLength(): number;
}
