import {DomainUser} from "../../../identity/";

/**
 * @hidden
 * @internal
 */
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
