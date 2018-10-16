export class Client {

    private _clientId: string;

    constructor(socketId: string) {
        this._clientId = socketId;
    }
    get clientId(): string {
        return this._clientId;
    }
}