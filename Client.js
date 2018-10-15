"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    // constructor(socket: SocketIO.Socket) {
    //     this.socket = socket;
    // }
    constructor(socketId) {
        this._clientId = socketId;
    }
    get clientId() {
        return this._clientId;
    }
}
exports.Client = Client;
