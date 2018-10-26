import shortid from "shortid";
import { EventEmitter } from "events";
import { Socket } from "socket.io";

import { RoomState } from "./RoomState";

export class Room {
    //Unique id
    public readonly roomId: string;
    //Room socket space
    private nsp: SocketIO.Namespace;
    //Current state that handles events
    private state: RoomState;
    //State event emitter
    private roomEventEmitter = new EventEmitter();

    //State prototype list
    private stateList: any;
    private stateIndex = 0;
    private stateLock = false;

    constructor(server: SocketIO.Server, states: any) {
        //generate unique id for room
        this.roomId = shortid.generate();
        //set room namespace
        this.nsp = server.in(this.roomId);
        //set state list prototypes
        this.stateList = states;
        //Start with first state
        this.NextState();
    }

    //Get socket with id
    public getSocket(socketId: string): Socket {
        return this.nsp.connected[socketId];
    }

    //Get all sockets in the room
    public getSockets(): Socket[] {
        let socketArr: Socket[] = [];
        Object.keys(this.nsp.connected).forEach((val) => {
            socketArr.push(this.nsp.connected[val]);
        });
        return socketArr;
    }

    public requestJoin(socket: Socket): boolean {
        let isAvailable = this.state.requestJoin(socket);

        if (isAvailable)
            this.clientJoin(socket);

        return isAvailable;
    }

    private clientJoin(socket: Socket): void {
        var roomLeaveListener = () => {
            this.clientLeave(socket);
            socket.leave(this.roomId);
            socket.removeListener('roomLeave', roomLeaveListener);
            socket.removeListener('disconnect', roomLeaveListener);
        };
        socket.on('client_room_leave', roomLeaveListener);
        socket.on('disconnect', roomLeaveListener);

        /*
        Passes eventName for state to handle.
        State needs to implement the given event in the setStateEvents method by overriding.
        */
        socket.on('client_event', (eventName: string, ...args: any | any[]) => { this.roomEventEmitter.emit(eventName, socket, args); });
        this.roomEventEmitter.emit("onClientJoin", socket);
    }

    private clientLeave(socket: Socket): void {
        this.roomEventEmitter.emit("onClientLeave", socket);
    }

    //Communication
    public RPC(event: string, socketOrSocketId?: Socket | string, ...args: any[]): void {
        if (socketOrSocketId === undefined || socketOrSocketId === null) {
            this.nsp.emit(event, args);
        }
        else if (typeof (socketOrSocketId) === "string") {
            let _socket = this.getSocket(socketOrSocketId);
            _socket.emit(event, args);
        }
        else {
            socketOrSocketId.emit(event, args);
        }

    }

    private patchState(newState: ArrayBuffer): ArrayBuffer {
        //Delta fossil algorithm patch prev&current state
        return newState;
    }

    //Set next state in state list
    public NextState(): void {
        this.stateLock = true;
        let statePrototype: any = this.stateList[this.stateIndex];

        if (statePrototype == null || statePrototype == undefined) {
            console.log("No states left in the state list");
            return;
        }

        this.state = new statePrototype(this, this.roomEventEmitter);
        this.stateIndex++;
        this.stateLock = false;
    }

    //Send state to clients
    public SendState(): void {
        //Wait for proceedState to finish
        if (this.stateLock) {
            setTimeout(() => { this.SendState(); }, 500);
            return;
        }
        let serializedState = this.state.Serialize();

        let patchedState = this.patchState(serializedState);
        this.nsp.emit('server_room_stateUpdate', patchedState);
    }
}