import shortid from "shortid";
import { EventEmitter } from "events";
import { Socket } from "socket.io";

import { RoomState } from "./RoomState";
import { MatchmakeState } from "./MatchmakeState";
import { Client } from "./Client";

export class Room {
    //Unique id for this room
    public readonly roomId: string;
    //Server socket
    private server: SocketIO.Server;
    //Current state that handles events
    private state: RoomState;
    //State event emitter
    private roomEventEmitter = new EventEmitter();

    constructor(server: SocketIO.Server) {
        //generate unique id for room
        this.roomId = shortid.generate();
        //set server socket
        this.server = server;
        //Set matchmaking state
        this.state = new MatchmakeState(this.roomEventEmitter);

        setInterval(() => this.broadcast<string>("HELLO WORLD"), 2000);
    }

    //Get socket with client id
    private getSocket(client: Client): Socket {
        return this.server.sockets.connected[client.clientId];
    }

    public requestJoin(client: Client): boolean {
        return this.state.requestJoin(client);
    }

    public clientJoin(client: Client): void {
        let socket = this.getSocket(client);

        socket.emit('roomJoin', this.roomId);

        var roomLeaveListener = () => {
            this.clientLeave(client);
            socket.leave(this.roomId);
            socket.removeListener("roomLeave", roomLeaveListener);
            socket.removeListener("disconnect", roomLeaveListener);
        };
        socket.on('roomLeave', roomLeaveListener);
        socket.on('disconnect', roomLeaveListener);


        this.roomEventEmitter.emit("onClientJoin", client);
        console.log(`Client:${client.clientId} joined the room:${this.roomId}`);
    }

    public clientLeave(client: Client): void {
        this.roomEventEmitter.emit("onClientLeave", client);
        console.log(`Client:${client.clientId} left the room:${this.roomId}`);
    }

    public clientMessage(data: string): void {
        this.roomEventEmitter.emit("onClientMessage", data);
    }

    //Broadcast message to all clients except sender
    public clientBroadcast<T>(client: Client, data: T): void {
        let clientSocket = this.server.sockets.connected[client.clientId];
        clientSocket.in(this.roomId).emit('broadcast', data);
    }
    //Broadcast message to all clients in the room
    public broadcast<T>(data: T): void {
        this.server.in(this.roomId).emit("broadcast", data);
    }

    private patchState(): void {
        //Delta fossil algorithm patch prev&current state
    }

    //Send state to clients
    private sendState(): void {
        this.patchState();

        var buffer = this.state.Serialize();
    }

    private changeState(newState: RoomState): void {
        this.roomEventEmitter.removeAllListeners();
        this.state = newState;
    }
}