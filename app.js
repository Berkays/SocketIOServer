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
io.on('connection', function (socket) {
    //Search for an available room or create one
    socket.on('matchmake', (player) => {
        let room = null;
        //Search room
        room = searchRoom();
        //Create room
        if (room == null)
            room = createRoom();
        room.Join(player);
        socket.emit('onRoomJoin', room.roomId);
        socket.on('roomLeave', (player) => {
            rooms[player.connectedRoom].Leave(player);
            destroyRoom(rooms[player.connectedRoom]);
        });
    });
    socket.on('disconnect', () => {
        console.log("user disconnected");
    });
});
server.listen(port);
function searchRoom() {
    if (rooms == null)
        return null;
    let _room = null;
    Object.keys(rooms).forEach((key) => {
        let room = rooms[key];
        debugSearchRoom(room);
        if (room.isJoinable())
            _room = room;
    });
    return _room;
}
function createRoom() {
    let room = new Room_1.Room();
    rooms[room.roomId] = room;
    debugCreateRoom(room);
    return room;
}
function destroyRoom(room) {
    if (room.playerCount == 0) {
        delete rooms[room.roomId];
        room = null;
    }
}
function debugSearchRoom(room) {
    if (room != null) {
        console.log("Room found: " + room.roomId);
    }
    else {
        console.log("Room not found. Creating...");
    }
}
function debugCreateRoom(room) {
    console.log("Room created: " + room.roomId);
}
