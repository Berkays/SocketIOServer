export class Client {
    public readonly clientId: string;

    constructor(socketId: string) {
        this.clientId = socketId;
    }
}