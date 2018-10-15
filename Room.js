"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shortid = require('shortid');
const MatchmakeState_1 = require("./MatchmakeState");
const PlayerDictionary_1 = require("./PlayerDictionary");
const maxPlayerCount = 2;
class Room {
    constructor() {
        this.roomId = shortid.generate();
        this.playerCount = 0;
        this.lock = false;
        this.players = new PlayerDictionary_1.PlayerDictionary();
        this.roomState = new MatchmakeState_1.MatchmakeState();
    }
    isJoinable() {
        if (this.lock == true)
            return false;
        if (this.playerCount < maxPlayerCount) {
            return true;
        }
        else {
            return false;
        }
    }
    Join(player) {
        this.players[player.id] = player;
        this.playerCount++;
    }
    Leave(player) {
        delete this.players[player.id];
        this.playerCount--;
    }
}
exports.Room = Room;
