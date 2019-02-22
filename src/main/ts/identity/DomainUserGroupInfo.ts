export class DomainUserGroupInfo {
  constructor(public readonly id: string,
              public readonly description: string) {
    Object.freeze(this);
  }
}
