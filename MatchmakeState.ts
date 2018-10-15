import { RoomState } from "./RoomState";
import { Client } from "./Client";
import { ClientDictionary } from "./ClientDictionary";

const maxPlayerCount = 2;

export class MatchmakeState extends RoomState {

    clients: ClientDictionary;
    playerCount: number;
    locked: boolean; //Lock is used to prevent clients from joining the room

    constructor() {
        super();

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

    public clientJoin(client: Client): void {

        this.clients[client.clientId] = client;
        this.playerCount++;

        if (this.playerCount == maxPlayerCount) {
            //Do:start game action
            this.locked = true;
        }
    }

    public clientLeave(client: Client) {
        delete this.clients[client.clientId];
        this.playerCount--;

        
        if (this.playerCount == 0)
        {
            //Do:destroy room
        }
        else if(this.locked)
        {
            //Unlock room for join
            this.locked = false;
        }
    }


}