import SocketIO = require('socket.io');

import { Room } from "./Room";
import { RoomMap } from "./RoomMap";
import { Client } from "./Client";

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = SocketIO(server);

const port = 5000;

let rooms:RoomMap = {};

io.on('connection', (socket) => {
    //Search for an available room or create one
    socket.on('matchmake', (client: Client) => matchmakePlayer(socket, client));
});

server.listen(port);

//Joins client socket to a new or existing room.
function matchmakePlayer(socket: SocketIO.Socket, client: Client): void {

    let room: Room = null;

    //Search for an available room.
    room = searchRoom(client);

    //If no available room found, create new room.
    if (room == null)
        room = createRoom();

    socket.join(room.roomId, () => {
        room.clientJoin(client);
    });
}

//Searches an available room from the rooms list.
function searchRoom(client: Client): Room {
    if (rooms == null)
        return null;
    let _room: Room = null;
    Object.keys(rooms).forEach((key) => {
        let room = rooms[key];

        if (room.requestJoin(client))
            _room = room;


        debugSearchRoom(_room);
    });

    return _room;
}

//Creates a new room.
function createRoom(): Room {
    let room = new Room(io);

    rooms[room.roomId] = room;

    debugCreateRoom(room);

    return room;
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