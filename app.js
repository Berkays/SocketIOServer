"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Room_1 = require("./Room");
const RoomDictionary_1 = require("./RoomDictionary");
const SocketIO = require("socket.io");
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = SocketIO(server);
const port = 5000;
let rooms = new RoomDictionary_1.RoomDictionary();
io.on('connection', (socket) => {
    //Search for an available room or create one
    socket.on('matchmake', (client) => matchmakePlayer(socket, client));
});
server.listen(port);
function matchmakePlayer(socket, client) {
    let room = null;
    //Search for an available room.
    room = searchRoom(client);
    //If no available room found, create new room.
    if (room == null)
        room = createRoom();
    //Add client to room
    room.onClientJoin(client);
    //Notify client on room join
    socket.join(room.RoomId, () => {
        socket.emit('roomJoin', room.RoomId);
    });
}
function searchRoom(client) {
    if (rooms == null)
        return null;
    let _room = null;
    Object.keys(rooms).forEach((key) => {
        let room = rooms[key];
        debugSearchRoom(room);
        if (room.requestJoin(client))
            _room = room;
    });
    return _room;
}
function createRoom() {
    let room = new Room_1.Room(io);
    rooms[room.RoomId] = room;
    debugCreateRoom(room);
    return room;
}
function debugSearchRoom(room) {
    if (room != null) {
        console.log("Room found: " + room.RoomId);
    }
    else {
        console.log("Room not found. Creating...");
    }
}
function debugCreateRoom(room) {
    console.log("Room created: " + room.RoomId);
}
function broadcastTest() {
    setTimeout(() => {
        Object.keys(rooms).forEach((key) => {
            let room = rooms[key];
            room.broadcast("hi from " + room.RoomId);
        });
    }, 5000);
}
