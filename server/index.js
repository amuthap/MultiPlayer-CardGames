import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { LobbyManager } from './lobby.js';
import { RoomManager } from './room.js';
import { PlayerDB } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(join(__dirname, '../public')));

const lobbyManager = new LobbyManager();
const roomManager = new RoomManager();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('signup', async ({ username, displayName, email, password }) => {
    const result = await PlayerDB.signup(username, password, displayName, email);

    if (result.success) {
      socket.emit('signup_success', { message: result.message });
    } else {
      socket.emit('error', { message: result.message });
    }
  });

  socket.on('login', async ({ username, password }) => {
    const result = await PlayerDB.login(username, password);

    if (result.success) {
      socket.emit('login_success', { player: result.player });
      console.log(`User logged in: ${result.player.username} (${socket.id})`);
    } else {
      socket.emit('error', { message: result.message });
    }
  });

  socket.on('logout', () => {
    lobbyManager.removePlayer(socket.id);
    console.log(`User logged out: ${socket.id}`);
  });

  socket.on('join_lobby', (playerName) => {
    const player = lobbyManager.addPlayer(socket.id, playerName);
    socket.emit('lobby_joined', {
      playerId: socket.id,
      playerName: player.name,
      rooms: roomManager.getRoomsList()
    });
    io.emit('lobby_update', {
      players: lobbyManager.getPlayers(),
      rooms: roomManager.getRoomsList()
    });
  });

  socket.on('create_room', ({ roomName, maxPlayers, gameType }) => {
    const player = lobbyManager.getPlayer(socket.id);
    if (!player) {
      socket.emit('error', { message: 'You must join the lobby first' });
      return;
    }

    const room = roomManager.createRoom(roomName, maxPlayers, gameType, player);
    socket.join(room.id);
    lobbyManager.removePlayer(socket.id);

    socket.emit('room_created', { room });
    io.emit('lobby_update', {
      players: lobbyManager.getPlayers(),
      rooms: roomManager.getRoomsList()
    });
  });

  socket.on('join_room', (roomId) => {
    const player = lobbyManager.getPlayer(socket.id);
    if (!player) {
      socket.emit('error', { message: 'You must join the lobby first' });
      return;
    }

    const room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    roomManager.addPlayerToRoom(roomId, player);
    socket.join(roomId);
    lobbyManager.removePlayer(socket.id);

    socket.emit('room_joined', { room });
    io.to(roomId).emit('room_update', { room });
    io.emit('lobby_update', {
      players: lobbyManager.getPlayers(),
      rooms: roomManager.getRoomsList()
    });
  });

  socket.on('leave_room', (roomId) => {
    console.log('Player leaving room:', socket.id, 'Room:', roomId);
    const room = roomManager.getRoom(roomId);
    if (!room) {
      console.log('Room not found:', roomId);
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      console.log('Player not found in room');
      return;
    }

    console.log('Player found:', player.name);
    const updatedRoom = roomManager.removePlayerFromRoom(roomId, socket.id);
    socket.leave(roomId);
    lobbyManager.addPlayer(socket.id, player.name);

    console.log('Players remaining in room:', updatedRoom.players.length);

    console.log('Emitting returned_to_lobby to', socket.id);
    socket.emit('returned_to_lobby', {
      rooms: roomManager.getRoomsList()
    });

    // Notify remaining players in the room
    if (updatedRoom.players.length > 0) {
      io.to(roomId).emit('room_update', { room: updatedRoom });
    }

    // Check if room is now empty and should be deleted
    if (updatedRoom.players.length === 0) {
      console.log('🗑️  Room is empty - DELETING room:', roomId);
      roomManager.deleteRoom(roomId);
      console.log('✅ Room deleted successfully');
    }

    // Update lobby for all players
    io.emit('lobby_update', {
      players: lobbyManager.getPlayers(),
      rooms: roomManager.getRoomsList()
    });

    console.log('Leave room complete');
  });

  socket.on('start_game', (roomId) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    if (room.host.id !== socket.id) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }

    if (room.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start' });
      return;
    }

    const result = roomManager.startGame(roomId);

    // Create a clean room object without circular references
    const cleanRoom = {
      id: result.room.id,
      name: result.room.name,
      maxPlayers: result.room.maxPlayers,
      gameType: result.room.gameType,
      host: result.room.host,
      players: result.room.players,
      gameStarted: result.room.gameStarted
    };

    for (const player of result.room.players) {
      io.to(player.id).emit('game_started', {
        room: cleanRoom,
        gameState: result.initResult,
        yourHand: result.room.game.getPlayerHand(player.id)
      });
    }

    io.to(roomId).emit('game_state_update', {
      publicState: result.room.game.getPublicGameState()
    });
  });

  socket.on('drop_cards', ({ roomId, cardIds, takeFromDeck }) => {
    const game = roomManager.getGame(roomId);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const result = game.dropCards(socket.id, cardIds, takeFromDeck);

    if (!result.success) {
      socket.emit('error', { message: result.message });
      return;
    }

    const room = roomManager.getRoom(roomId);
    for (const player of room.players) {
      io.to(player.id).emit('cards_dropped', {
        result,
        yourHand: game.getPlayerHand(player.id),
        publicState: game.getPublicGameState()
      });
    }
  });

  socket.on('show_cards', ({ roomId }) => {
    const game = roomManager.getGame(roomId);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const result = game.showCards(socket.id);

    io.to(roomId).emit('game_ended', {
      result,
      winner: result.winner,
      loser: result.loser
    });
  });

  socket.on('play_again', ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    console.log('Play again requested for room:', roomId);

    // Start a new game for the same room
    const result = roomManager.startGame(roomId);
    if (!result) {
      socket.emit('error', { message: 'Failed to start game' });
      return;
    }

    console.log('New game started, dealing cards to players');

    const cleanRoom = {
      id: result.room.id,
      name: result.room.name,
      maxPlayers: result.room.maxPlayers,
      gameType: result.room.gameType,
      host: result.room.host,
      players: result.room.players,
      gameStarted: result.room.gameStarted
    };

    // Get the game from the room
    const game = result.room.game;

    for (const player of result.room.players) {
      io.to(player.id).emit('game_started', {
        room: cleanRoom,
        yourHand: game.getPlayerHand(player.id),
        gameState: game.getPublicGameState()
      });
    }

    io.to(roomId).emit('room_update', { room: cleanRoom });
    console.log('Play again complete - new round started');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    lobbyManager.removePlayer(socket.id);

    const rooms = roomManager.getAllRooms();
    for (const room of rooms) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        console.log(`Removing disconnected player ${player.name} from room ${room.id}`);
        const updatedRoom = roomManager.removePlayerFromRoom(room.id, socket.id);

        console.log('Players remaining in room:', updatedRoom.players.length);

        if (updatedRoom.players.length > 0) {
          io.to(room.id).emit('room_update', { room: updatedRoom });
        } else {
          console.log('🗑️  Room is empty after disconnect - DELETING room:', room.id);
          roomManager.deleteRoom(room.id);
          console.log('✅ Room deleted successfully');
        }
        break;
      }
    }

    io.emit('lobby_update', {
      players: lobbyManager.getPlayers(),
      rooms: roomManager.getRoomsList()
    });
  });
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - keep server running
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to play`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
