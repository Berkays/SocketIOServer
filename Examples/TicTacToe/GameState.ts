import { Socket } from 'socket.io';
import { EventEmitter } from 'events';
import { BSON } from 'bsonfy';

import { RoomState } from "../../RoomState";
import { Room } from '../../Room';

const DRAW = 2;

export class GameState extends RoomState {

    private players: Socket[] = [];
    private gameBoard = [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]];
    private currentTurn = 0; //0 = X,1 = O
    private isGameOver = false;
    private isDraw = false;

    constructor(room: Room, eventEmitter: EventEmitter) {
        super(room, eventEmitter);
        this.startGame();
    }

    protected setStateEvents(): void {
        super.setStateEvents();
        this.stateEventEmitter.on("playTurn", (sender: Socket, move: number) => {
            this.playTurn(sender.id, move);
        }); //Listen playTurn event from client
        //TODO: Splits args into variables
    }

    public requestJoin(socket: Socket): boolean {
        return false;
    }

    protected onClientJoin(socket: Socket): void {
    }

    protected onClientLeave(socket: Socket): void {
        if (this.players[0].id == socket.id) {
            this.room.RPC('gameOver', null, 1);
        }
        else {
            this.room.RPC('gameOver', null, 0);
        }
    }

    public Serialize(): ArrayBuffer {
        let gameState = { game: this.gameBoard, turn: this.currentTurn };
        return BSON.serialize(gameState).buffer;
    }

    private startGame(): void {
        this.players = this.room.getSockets();

        this.currentTurn = Math.floor(Math.random() * Math.floor(2)); //Random initial turn.

        this.room.RPC('gameStart', null); //Notify clients that the game has started.

        this.SendState(); //Send state to clients
        this.giveTurn();
    }

    private giveTurn(): void {
        this.room.RPC('turn', this.players[this.currentTurn]);
    }

    private playTurn(player: string, move: number): void {
        //Check if sending player has turn
        if (player == this.players[this.currentTurn].id) {
            let row = Math.floor(move / 3);
            let col = move % 3;
            let cellVal = this.gameBoard[row][col];

            if (cellVal == -1) {
                this.gameBoard[row][col] = this.currentTurn;
                this.checkGame();
            }
            else {
                //Invalid play. Give turn to same player
                this.SendState();
                this.giveTurn();
                return;
            }
        }

        if (this.isGameOver) {
            this.SendState();
            if (this.isDraw)
                this.room.RPC('gameOver', null, DRAW);
            else
                this.room.RPC('gameOver', null, this.currentTurn);
        }
        else {
            //Change turn
            this.currentTurn = (this.currentTurn + 1) % 2;

            this.SendState();
            this.giveTurn();
        }
    }

    private checkGame(): void {
        for (let y = 0; y < 3; y++) {
            if (this.gameBoard[y][0] == this.currentTurn && this.gameBoard[y][1] == this.currentTurn && this.gameBoard[y][2] == this.currentTurn) {
                this.isGameOver = true;
                break;
            }
        }

        for (let x = 0; x < 3; x++) {
            if (this.gameBoard[0][x] == this.currentTurn && this.gameBoard[1][x] == this.currentTurn && this.gameBoard[2][x] == this.currentTurn) {
                this.isGameOver = true;
                break;
            }
        }

        if (this.gameBoard[0][0] == this.currentTurn && this.gameBoard[1][1] == this.currentTurn && this.gameBoard[2][2] == this.currentTurn) {
            this.isGameOver = true;
        }

        if (this.gameBoard[0][2] == this.currentTurn && this.gameBoard[1][1] == this.currentTurn && this.gameBoard[2][0] == this.currentTurn) {
            this.isGameOver = true;
        }

        //Check Draw
        this.isDraw = true;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (this.gameBoard[y][x] == -1) {
                    this.isDraw = false;
                    break;
                }
            }
        }

        if (this.isDraw)
            this.isGameOver = true;
    }

}