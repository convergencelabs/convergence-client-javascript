import DomainUser from "../../../identity/DomainUser";

export var DomainUserDeserilizer: (user: any) => DomainUser =  (body: any) => {
  return new DomainUser(
    body.i,
    body.n,
    body.f,
    body.l,
    body.e
  );
};
