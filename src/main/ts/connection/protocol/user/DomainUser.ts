import {DomainUser} from "../../../identity/DomainUser";

export const DomainUserDeserializer: (user: any) => DomainUser =  (body: any) => {
  return new DomainUser(
    body.t,
    body.n,
    body.f,
    body.l,
    body.d,
    body.e
  );
};
