export class ChatMember {
    private _username: string;
    private _sessionId: string;

    constructor(username: string, sessionId: string) {
        this._username = username;
        this._sessionId = sessionId;
        Object.freeze(this);
    }

    public username(): string {
        return this._sessionId;
    }

    public sessionId(): string {
        return this._username;
    }
}
