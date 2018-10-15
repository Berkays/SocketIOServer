"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shortid = require('shortid');
const MatchmakeState_1 = require("./MatchmakeState");
class Room {
    constructor(server) {
        //generate unique id for room
        this.roomId = shortid.generate();
        this.server = server;
        //Set matchmaking state
        this.state = new MatchmakeState_1.MatchmakeState();
    }
    get RoomId() {
        return this.roomId;
    }
    getState() {
        return this.state;
    }
    requestJoin(client) {
        return this.state.requestJoin(client);
    }
    onClientJoin(client) {
        this.state.clientJoin(client);
    }
    onClientLeave(client) {
        this.state.clientLeave(client);
    }
    broadcast(data) {
        this.server.in(this.roomId).emit("broadcast", data);
    }
    patchState() {
        //Delta fossil algorithm patch prev&current state
    }
    sendState() {
        //Send state changes
        this.patchState();
    }
}
exports.Room = Room;
