import SocketIO = require('socket.io');

export class Client {

    private socket: SocketIO.Socket;

    public clientId(): string {
        return this.socket.id;
    }
}