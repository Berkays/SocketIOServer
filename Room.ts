const shortid = require('shortid');

import { Player } from "./Player";
import { RoomState } from "./RoomState";
import { MatchmakeState } from "./MatchmakeState";
import { PlayerDictionary } from "./PlayerDictionary";

const maxPlayerCount = 2;

export class Room {
    roomId: string;
    playerCount: number;
    players: PlayerDictionary;
    
    private lock: boolean;

    private roomState: RoomState;
    private prevRoomState: RoomState;

    constructor() {
        this.roomId = shortid.generate();
        this.playerCount = 0;
        this.lock = false;
        
        this.players = new PlayerDictionary();
        this.roomState = new MatchmakeState();
    }

    public isJoinable(): boolean {
        if (this.lock == true)
            return false;

        if (this.playerCount < maxPlayerCount) {
            return true;
        }
        else {
            return false;
        }
    }

    public Join(player: Player): void {
        this.players[player.id] = player;
        this.playerCount++;
    }

    public Leave(player: Player): void {
        delete this.players[player.id];
        this.playerCount--;
    }
}