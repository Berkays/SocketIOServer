import { Room } from "./Room";
import { RoomDictionary } from "./RoomDictionary";
import SocketIO = require('socket.io');
import { Player } from "./Player";

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = SocketIO(server);

const port = 5000;

let rooms = new RoomDictionary();

io.on('connection', function (socket) {

    //Search for an available room or create one
    socket.on('matchmake', matchmakePlayer);
});

server.listen(port);


function matchmakePlayer(socket: SocketIO.Socket, player: Player): void {
    let room: Room = null;

    //Search room
    room = searchRoom();

    //Create room
    if (room == null)
        room = createRoom();

    room.Join(player);

    socket.emit('onRoomJoin', room.roomId);
    socket.on('roomLeave', (player: Player) => {
        rooms[player.connectedRoom].Leave(player);
        destroyRoom(rooms[player.connectedRoom]);
    });
}

function searchRoom(): Room {
    if (rooms == null)
        return null;
    let _room: Room = null;
    Object.keys(rooms).forEach((key) => {
        let room = rooms[key];

        debugSearchRoom(room);

        if (room.isJoinable())
            _room = room;
    });

    return _room;
}

function createRoom(): Room {
    let room = new Room();

    rooms[room.roomId] = room;

    debugCreateRoom(room);

    return room;
}

function destroyRoom(room: Room): void {
    if (room.playerCount == 0) {
        delete rooms[room.roomId];
        room = null;
    }
}

function debugSearchRoom(room: Room): void {
    if (room != null) {
        console.log("Room found: " + room.roomId);
    }
    else {
        console.log("Room not found. Creating...");
    }
}
function debugCreateRoom(room: Room): void {
    console.log("Room created: " + room.roomId);
}