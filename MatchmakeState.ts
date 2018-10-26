import { BSON } from 'bsonfy';

import { RoomState } from './RoomState';
import { Socket } from 'socket.io';

const maxPlayerCount = 2;
const roomDestroyTime = 2000;

export class MatchmakeState extends RoomState {
    //Current player count in the room
    private playerCount: number = 0;
    //Locked rooms cannot be joined
    private locked: boolean = false; //TODO: Move lock to Room.ts
    //Inactive room destroy timer
    private timer: NodeJS.Timeout;

    public requestJoin(socket: Socket): boolean {
        if (this.locked)
            return false;

        if (this.playerCount < maxPlayerCount)
            return true;
        else
            return false;
    }

    protected onClientJoin(socket: Socket): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        //Notify client
        this.room.RPC('server_room_join', socket, this.room.roomId);

        this.playerCount++;
        console.log(`Client:${socket.id} joined the room:${this.room.roomId}`);
        console.log("Player Count:" + this.playerCount);
        if (this.playerCount == maxPlayerCount) {
            this.locked = true;
            this.room.NextState();
        }
    }

    protected onClientLeave(socket: Socket): void {
        this.playerCount--;

        if (this.playerCount == 0) {
            this.destroyRoom();
        }
        else if (this.locked) {
            //Unlock room for join
            this.locked = false;
        }
        console.log(`Client:${socket.id} left the room:${this.room.roomId}`);
        console.log("Player Count:" + this.playerCount);
    }

    public Serialize(): ArrayBuffer {
        return BSON.serialize({
            playerCount: this.playerCount
        }).buffer;
    }

    //Destroy room if no activity in 'roomDestroyTime' ms
    private destroyRoom(): void {
        this.timer = setTimeout(() => {
            //TODO: Mark room for destroy
        }, roomDestroyTime);
    }

}