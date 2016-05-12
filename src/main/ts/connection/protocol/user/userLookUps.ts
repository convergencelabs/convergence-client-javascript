import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import DomainUser from "../../../identity/DomainUser";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {DomainUserDeserilizer} from "./DomainUser";

var userFieldCodes: {[key: string]: number} = {
  "userid": 0,
  "username": 1,
  "firstname": 2,
  "lastname": 3,
  "email": 4
};

export interface UserLookUpRequest extends OutgoingProtocolRequestMessage {
  field: string;
  values: string[];
}

export var UserLookUpRequestSerializer: MessageBodySerializer = (request: UserLookUpRequest) => {
  return {
    f: userFieldCodes[request.field],
    v: request.values
  };
};

export interface UserSearchRequest extends OutgoingProtocolRequestMessage {
  fields: string[];
  value: string;
  offset: number;
  limit: number;
  orderBy: string;
  ascending: boolean;
}


export var UserSearchRequestSerializer: MessageBodySerializer = (request: UserSearchRequest) => {
  var sort: number;

  if (request.ascending !== undefined) {
    sort = request.ascending ? 0 : 1;
  }

  return {
    f: request.fields.map((field: string) => {
      return userFieldCodes[field];
    }),
    v: request.value,
    o: request.offset,
    l: request.limit,
    r: userFieldCodes[request.orderBy],
    s: sort
  };
};


export interface UserListResponse {
  users: DomainUser[];
}

export var UserListResponseDeserializer: MessageBodyDeserializer<UserListResponse> = (body: any) => {
  var users: DomainUser[] = (<any[]>body.u).map((u: any) => {
    return DomainUserDeserilizer(u);
  });

  return {
    users: users
  };
};
