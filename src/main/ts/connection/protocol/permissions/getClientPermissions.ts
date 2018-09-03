import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

/**
 * @hidden
 * @internal
 */
export interface GetClientPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: string;
}

/**
 * @hidden
 * @internal
 */
export function GetClientPermissionsRequestSerializer(request: GetClientPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id
  };
}

/**
 * @hidden
 * @internal
 */
export interface GetClientPermissionsResponse extends IncomingProtocolNormalMessage {
  permissions: string[];
}

/**
 * @hidden
 * @internal
 */
export function GetClientPermissionsResponseDeserializer(body: any): GetClientPermissionsResponse {
  const result: GetClientPermissionsResponse = {
    permissions: body.p
  };
  return result;
}
