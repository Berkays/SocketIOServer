import SocketIO = require('socket.io');

export class Client {
    // private socket: SocketIO.Socket;
    private _clientId: string;
    // constructor(socket: SocketIO.Socket) {
    //     this.socket = socket;
    // }
    constructor(socketId: string) {
        this._clientId = socketId;
    }
    get clientId(): string {
        return this._clientId;
    }
}