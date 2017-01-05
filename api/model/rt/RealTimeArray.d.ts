import {RealTimeElement} from "./RealTimeElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ObservableArray} from "../observable/ObservableArray";
import {RealTimeElementEvents} from "../../../src/main/ts/model/rt/RealTimeElement";

export interface RealTimeArrayEvents extends RealTimeElementEvents{
  CLOSED: string;
  DELETED: string;
  MODIFIED: string;
  COMMITTED: string;
  VERSION_CHANGED: string;
  COLLABORATOR_OPENED: string;
  COLLABORATOR_CLOSED: string;
  REFERENCE: string;
}

export declare class RealTimeArray extends RealTimeElement<any[]>
  implements RealTimeContainerElement<any[]>, ObservableArray {

  public static Events: any;

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

  public elementAt(pathArgs: any): RealTimeElement<any>;
}
