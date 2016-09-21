import {ReferenceMap} from "./ReferenceMap";
import {LocalModelReference} from "./LocalModelReference";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
export declare class ReferenceManager {
  private _referenceMap;
  private _localReferences;
  private _validTypes;
  private _source;

  constructor(source: any, validTypes: string[]);

  referenceMap(): ReferenceMap;

  addLocalReference(reference: LocalModelReference<any, any>): void;

  removeLocalReference(key: string): void;

  removeAllLocalReferences(): void;

  getLocalReference(key: string): LocalModelReference<any, any>;

  localReferences(): {
    [key: string]: LocalModelReference<any, any>;
  };

  handleRemoteReferenceEvent(event: RemoteReferenceEvent): void;

  private _handleRemoteReferencePublished(event);

  private _handleRemoteReferenceUnpublished(event);

  private _handleRemoteReferenceCleared(event);

  private _handleRemoteReferenceSet(event);
}
