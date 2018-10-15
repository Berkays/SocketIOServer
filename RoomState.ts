import { Client } from "./Client";

export abstract class RoomState {

    public requestJoin(client: Client): boolean {
        return true;
    }
    public clientJoin(client: Client) {

    }

    public clientLeave(client: Client) {

    }
}