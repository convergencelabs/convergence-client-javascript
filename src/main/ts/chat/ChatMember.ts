export class ChatMember {
    constructor(public username: string, public sessionId: string) {
        Object.freeze(this);
    }
}
