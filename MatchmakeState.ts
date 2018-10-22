import { EventEmitter } from "events";
const BSON = require('bson');

import { RoomState } from "./RoomState";
import { Client } from "./Client";
import { ClientMap } from "./ClientMap";

const maxPlayerCount = 2;
const roomDestroyTime = 2000;

export class MatchmakeState extends RoomState {

    //List of connected clients in the room
    private clients: ClientMap;
    //Current player count in the room
    private playerCount: number;
    //Locked rooms cannot be joined
    private locked: boolean;

    private timer: NodeJS.Timeout;

    constructor(stateEventEmitter: EventEmitter) {
        super(stateEventEmitter);

        this.clients = {};
        this.playerCount = 0;
        this.locked = false;
    }

    requestJoin(client: Client): boolean {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        if (this.locked)
            return false;

        if (this.playerCount < maxPlayerCount)
            return true;
        else
            return false;
    }

    onClientJoin(client: Client): void {
        if (this.clients[client.clientId])
            return;
        this.clients[client.clientId] = client;
        this.playerCount++;

        if (this.playerCount == maxPlayerCount) {
            //Do:start game action
            this.locked = true;
        }
    }

    onClientLeave(client: Client): void {
        if (!this.clients[client.clientId])
            return;

        delete this.clients[client.clientId];
        this.playerCount--;

        if (this.playerCount == 0) {
            this.destroyRoom();
        }
        else if (this.locked) {
            //Unlock room for join
            this.locked = false;
        }
    }

    Serialize(): Buffer {
        return BSON.serialize({
            clients: this.clients,
            playerCount: this.playerCount
        });
    }

    //Destroy room if no activity in 'roomDestroyTime' ms
    destroyRoom(): void {
        this.timer = setTimeout(() => {
            this.stateEventEmitter.emit('destroy');
        }, roomDestroyTime);
    }

}