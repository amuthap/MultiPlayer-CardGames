import { v4 as uuidv4 } from 'uuid';
import { Deck } from './deck.js';
import { ReduceCardsGame } from './games/reduceCards.js';

export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(name, maxPlayers, gameType, host) {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      name: name || `Room_${roomId.substring(0, 6)}`,
      maxPlayers: maxPlayers || 4,
      gameType: gameType || 'reduceCards',
      host: {
        id: host.id,
        name: host.name
      },
      players: [{
        id: host.id,
        name: host.name,
        isHost: true
      }],
      gameStarted: false,
      createdAt: Date.now(),
      deck: null,
      game: null
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  getRoomsList() {
    return this.getAllRooms().map(room => ({
      id: room.id,
      name: room.name,
      maxPlayers: room.maxPlayers,
      currentPlayers: room.players.length,
      gameType: room.gameType,
      gameStarted: room.gameStarted,
      host: room.host
    }));
  }

  addPlayerToRoom(roomId, player) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.players.length >= room.maxPlayers) {
      return null;
    }

    room.players.push({
      id: player.id,
      name: player.name,
      isHost: false
    });

    return room;
  }

  removePlayerFromRoom(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);

    if (room.host.id === playerId && room.players.length > 0) {
      room.host = {
        id: room.players[0].id,
        name: room.players[0].name
      };
      room.players[0].isHost = true;
    }

    return room;
  }

  deleteRoom(roomId) {
    return this.rooms.delete(roomId);
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.gameStarted = true;
    room.deck = new Deck();

    if (room.gameType === 'reduceCards') {
      room.game = new ReduceCardsGame(room);
      const initResult = room.game.initializeGame();
      return { room, initResult };
    }

    return { room, initResult: null };
  }

  getGame(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.game : null;
  }
}
