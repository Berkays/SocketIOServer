import { Player } from "./Player";
import { Client } from "./Client";

export abstract class RoomState {
    public onClientJoin(client: Client) {

    }

    public onClientLeave(client: Client) {

    }
}