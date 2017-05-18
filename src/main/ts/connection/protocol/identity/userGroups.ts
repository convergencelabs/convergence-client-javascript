import {OutgoingProtocolRequestMessage} from "../protocol";
import {UserGroup} from "../../../identity/UserGroup";

export interface UserGroupRequest extends OutgoingProtocolRequestMessage {
  id: string;
}

export function UserGroupRequestSerializer(request: UserGroupRequest): any {
  return {
    i: request.id
  };
}

export interface UserGroupsResponse {
  groups: UserGroup[];
}

export function UserGroupsResponseDeserializer(body: any): UserGroupsResponse {
  const result: UserGroupsResponse = {
    groups: body.g.map((g: any) => deserializeUserGroup(g))
  };
  return result;
}

export interface UserGroupResponse {
  group: UserGroup;
}

export function UserGroupResponseDeserializer(body: any): UserGroupResponse {
  const result: UserGroupResponse = {
    group: deserializeUserGroup(body)
  };
  return result;
}

export function deserializeUserGroup(body: any): UserGroup {
  return new UserGroup(body.i, body.d, body.m);
}
