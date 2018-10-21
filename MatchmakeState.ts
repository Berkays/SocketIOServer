import { RoomState } from "./RoomState";
import { Client } from "./Client";
import { ClientDictionary } from "./ClientDictionary";
import { EventEmitter } from "events";

const maxPlayerCount = 2;

export class MatchmakeState extends RoomState {

    //List of connected clients in the room
    private clients: ClientDictionary;
    //Current player count in the room
    private playerCount: number;
    //Locked rooms cannot be joined
    private locked: boolean;

    constructor(stateEvents: EventEmitter) {
        super(stateEvents);

        this.clients = new ClientDictionary();
        this.playerCount = 0;
        this.locked = false;
    }

    public requestJoin(client: Client): boolean {
        if (this.locked)
            return false;

        if (this.playerCount < maxPlayerCount) {
            return true;
        }
        else {
            return false;
        }
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
            //Do:destroy room
        }
        else if (this.locked) {
            //Unlock room for join
            this.locked = false;
        }
    }

    public onClientMessage(data: string): void {
        //Do nothing in matchmaking
    }

}