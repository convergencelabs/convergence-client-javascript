export class DomainUserGroup {
  constructor(public readonly id: string,
              public readonly description: string,
              public readonly members: string[]) {
    Object.freeze(this);
  }
}
