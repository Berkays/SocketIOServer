import { EventEmitter } from "events";
import { Client } from "./Client";

export abstract class RoomState {

    private stateEventEmitter: EventEmitter;

    constructor(eventEmitter: EventEmitter) {
        this.stateEventEmitter = eventEmitter;
        this.setStateEvents();
    }

    private setStateEvents(): void {
        //Arrow functions to bind class instance to this reference instead of event emitter
        this.stateEventEmitter.on("onClientJoin", (client: Client) => { this.onClientJoin(client); });
        this.stateEventEmitter.on("onClientLeave", (client: Client) => { this.onClientLeave(client) });
        this.stateEventEmitter.on("onClientwMessage", (data: string) => { this.onClientMessage(data) });
    }

    abstract requestJoin(client: Client): boolean;

    abstract onClientJoin(client: Client): void;

    abstract onClientLeave(client: Client): void;

    abstract onClientMessage(data: string): void
}