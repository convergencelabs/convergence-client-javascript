import {RealTimeElement} from "./RealTimeElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ObservableArray, ObservableArrayEvents} from "../observable/ObservableArray";
import {Path, PathElement} from "../";

export interface RealTimeArrayEvents extends ObservableArrayEvents {
}

export declare class RealTimeArray extends RealTimeElement<any[]>
  implements RealTimeContainerElement<any[]>, ObservableArray {

  public static readonly Events: RealTimeArrayEvents;

  public get(index: number): RealTimeElement<any>;

  public set(index: number, value: any): RealTimeElement<any>;

  public insert(index: number, value: any): RealTimeElement<any>;

  public remove(index: number): Object | number | string | boolean;

  public reorder(fromIndex: number, toIndex: number): void;

  public push(value: any): RealTimeElement<any>;

  public pop(): any;

  public unshift(value: any): RealTimeElement<any>;

  public shift(): any;

  public length(): number;

  public some(callback: (element: RealTimeElement<any>, index?: number) => boolean): boolean;

  public every(callback: (element: RealTimeElement<any>, index?: number) => boolean): boolean;

  public find(callback: (element: RealTimeElement<any>, index?: number) => boolean): RealTimeElement<any>

  public findIndex(callback: (element: RealTimeElement<any>, index?: number) => boolean): number;

  public forEach(callback: (value: RealTimeElement<any>, index?: number) => void): void;

  public elementAt(path: Path): RealTimeElement<any>;
  public elementAt(...elements: PathElement[]): RealTimeElement<any>;
}
