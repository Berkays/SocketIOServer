import SocketIO = require('socket.io');

import { Room } from "./Room";
import { RoomMap } from "./RoomMap";
import { MatchmakeState } from './MatchmakeState';
import { GameState } from './Examples/TicTacToe/GameState';
import { Socket } from 'socket.io';

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = SocketIO(server);

const port = 5000;

let rooms: RoomMap = {};

const stateList: any =
    [
        MatchmakeState,
        GameState
    ]

io.on('connection', (socket) => {
    //Search for an available room or create one
    socket.on('client_room_join', () => matchmakePlayer(socket));
});

server.listen(port);

//Joins client socket to a new or existing room.
function matchmakePlayer(socket: Socket): void {
    //Search for an available room.
    let room = searchRoom(socket);

    //If no available room found, create new room.
    if (room == null)
        room = createRoom();

    //Join to room space
    socket.join(room.roomId, () => room.requestJoin(socket));
}

//Searches an available room from the rooms list.
function searchRoom(socket: Socket): Room {
    if (rooms == null)
        return null;
    let _room: Room = null;
    Object.keys(rooms).forEach((key) => {
        let room = rooms[key];

        if (room.requestJoin(socket))
            _room = room;

        debugSearchRoom(_room);
    });
    return _room;
}

//Create new room.
function createRoom(): Room {
    let room = new Room(io, stateList);

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