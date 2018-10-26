import { EventEmitter } from "events";

import { Room } from "./Room";
import { Socket } from "socket.io";

export abstract class RoomState {

    protected room: Room;
    protected stateEventEmitter: EventEmitter;

    constructor(room: Room, eventEmitter: EventEmitter) {
        this.room = room;
        this.stateEventEmitter = eventEmitter;
        this.setStateEvents();
    }

    //Override in derived class and call super.setStateEvents()
    protected setStateEvents(): void {
        this.stateEventEmitter.removeAllListeners();
        //Arrow functions to bind class instance to this reference instead of event emitter
        this.stateEventEmitter.on("onClientJoin", (socket: Socket) => { this.onClientJoin(socket); });
        this.stateEventEmitter.on("onClientLeave", (socket: Socket) => { this.onClientLeave(socket) });
    }

    public abstract requestJoin(socket: Socket): boolean;

    protected abstract onClientJoin(socket: Socket): void;

    protected abstract onClientLeave(socket: Socket): void;

    public abstract Serialize(): ArrayBuffer;

    protected SendState(): void {
        this.room.SendState();
    }
}