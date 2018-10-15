"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RoomState_1 = require("./RoomState");
const ClientDictionary_1 = require("./ClientDictionary");
const maxPlayerCount = 2;
class MatchmakeState extends RoomState_1.RoomState {
    constructor() {
        super();
        this.clients = new ClientDictionary_1.ClientDictionary();
        this.playerCount = 0;
        this.locked = false;
    }
    requestJoin(client) {
        if (this.locked)
            return false;
        if (this.playerCount < maxPlayerCount) {
            return true;
        }
        else {
            return false;
        }
    }
    clientJoin(client) {
        this.clients[client.clientId] = client;
        this.playerCount++;
        if (this.playerCount == maxPlayerCount) {
            //Do:start game action
            this.locked = true;
        }
    }
    clientLeave(client) {
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
}
exports.MatchmakeState = MatchmakeState;
