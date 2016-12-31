import {HistoricalElement} from "./HistoricalElement";
import {BooleanNode} from "../internal/BooleanNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {ObservableBoolean} from "../observable/ObservableBoolean";

export class HistoricalBoolean extends HistoricalElement<boolean> implements ObservableBoolean {
    constructor(_delegate: BooleanNode, _wrapperFactory: HistoricalWrapperFactory) {
        super(_delegate, _wrapperFactory);
    }
}
