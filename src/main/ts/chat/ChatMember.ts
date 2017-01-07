export class ChatMember {
    constructor(public readonly username: string, public readonly sessionId: string) {
        Object.freeze(this);
    }
}
