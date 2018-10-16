import { Room } from "./Room";
import { RoomDictionary } from "./RoomDictionary";
import SocketIO = require('socket.io');
import { Client } from "./Client";

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = SocketIO(server);

const port = 5000;

let rooms = new RoomDictionary();

io.on('connection', (socket) => {


    //Search for an available room or create one
    socket.on('matchmake', (client: Client) => matchmakePlayer(socket, client));
});

server.listen(port);


function matchmakePlayer(socket: SocketIO.Socket, client: Client): void {

    let room: Room = null;

    //Search for an available room.
    room = searchRoom(client);

    //If no available room found, create new room.
    if (room == null)
        room = createRoom();

    socket.join(room.RoomId, () => {
        room.onClientJoin(client);

        socket.on('roomLeave', () => {
            room.onClientLeave(client);
            socket.leave(room.RoomId);
        });
    });
}


function searchRoom(client: Client): Room {
    if (rooms == null)
        return null;
    let _room: Room = null;
    Object.keys(rooms).forEach((key) => {
        let room = rooms[key];

        debugSearchRoom(room);

        if (room.requestJoin(client))
            _room = room;
    });

    return _room;
}

function createRoom(): Room {
    let room = new Room(io);

    rooms[room.RoomId] = room;

    debugCreateRoom(room);

    return room;
}

function debugSearchRoom(room: Room): void {
    if (room != null) {
        console.log("Room found: " + room.RoomId);
    }
    else {
        console.log("Room not found. Creating...");
    }
}

function debugCreateRoom(room: Room): void {
    console.log("Room created: " + room.RoomId);
}