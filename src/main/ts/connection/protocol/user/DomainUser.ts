import {DomainUser} from "../../../identity/DomainUser";

export var DomainUserDeserializer: (user: any) => DomainUser =  (body: any) => {
  return new DomainUser(
    body.n,
    body.f,
    body.l,
    body.d,
    body.e
  );
};
