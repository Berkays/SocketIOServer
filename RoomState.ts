import { EventEmitter } from "events";
import { Client } from "./Client";

export abstract class RoomState {

    protected stateEventEmitter: EventEmitter;

    constructor(eventEmitter: EventEmitter) {
        this.stateEventEmitter = eventEmitter;
        this.setStateEvents();
    }

    protected setStateEvents(): void {
        //Arrow functions to bind class instance to this reference instead of event emitter
        this.stateEventEmitter.on("onClientJoin", (client: Client) => { this.onClientJoin(client); });
        this.stateEventEmitter.on("onClientLeave", (client: Client) => { this.onClientLeave(client) });
    }

    abstract requestJoin(client: Client): boolean;

    abstract onClientJoin(client: Client): void;

    abstract onClientLeave(client: Client): void;

    abstract Serialize(): Buffer;
}