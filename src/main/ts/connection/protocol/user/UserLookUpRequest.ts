import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import DomainUser from "../../../user/DomainUser";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {DomainUserDeserilizer} from "./DomainUser";

export interface UserLookUpRequest extends OutgoingProtocolRequestMessage {
  fields: string[];
  terms: string[];
};

export var UserLookUpRequestSerializer: MessageBodySerializer = (request: UserLookUpRequest) => {
  return {
    f: mapUserFields(request.fields),
    v: request.terms
  };
};

export interface UserLookUpResponse {
  users: DomainUser[];
};

export var UserLookUpResponseDesrializer: MessageBodyDeserializer =  (body: any) => {
  var users: DomainUser[] = (<any[]>body.u).map((u: any) => {
    return DomainUserDeserilizer(u);
  });

  return {
    users: users
  };
};

var userFieldCodes: {[key: string]: number} = {
  "userid": 0,
  "username": 1,
  "firstname": 2,
  "lastname": 3,
  "email": 4
};

function mapUserFields(fields: string[]): number[] {
  "use strict";

  return fields.map((field: string) => {
    return userFieldCodes[field];
  });
}
