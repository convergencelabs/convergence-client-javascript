export class DomainUserGroupSummary {
  constructor(public readonly id: string,
              public readonly description: string,
              public readonly members: number) {
    Object.freeze(this);
  }
}
