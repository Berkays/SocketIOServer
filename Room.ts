const shortid = require('shortid');

import { RoomState } from "./RoomState";
import { MatchmakeState } from "./MatchmakeState";
import { Client } from "./Client";

export class Room {

    private roomId: string;
    private state: RoomState;
    private server: SocketIO.Server;

    constructor(server: SocketIO.Server) {
        //generate unique id for room
        this.roomId = shortid.generate();

        this.server = server;

        //Set matchmaking state
        this.state = new MatchmakeState();
    }

    get RoomId(): string {
        return this.roomId;
    }

    public getState(): RoomState {
        return this.state;
    }

    public requestJoin(client: Client): boolean {
        return this.state.requestJoin(client);
    }

    public onClientJoin(client: Client): void {
        this.state.clientJoin(client);
    }

    public onClientLeave(client: Client): void {
        this.state.clientLeave(client);
    }

    public broadcast(data: string): void {
        this.server.in(this.roomId).emit("broadcast", data);
    }

    private patchState(): void {
        //Delta fossil algorithm patch prev&current state
    }

    private sendState(): void {
        //Send state changes
        this.patchState();
    }
}