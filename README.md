# Multiplayer Card Game

A real-time multiplayer card game platform with lobby and room system, built with Node.js, Express, and Socket.IO.

## Features

- **Player Lobby System**: Join a central lobby and see all available rooms and players
- **Room Management**: Create and join rooms with customizable settings
  - Set maximum players (2-6)
  - Choose game type
  - Host controls (start game, manage room)
- **54-Card Deck**: Standard 52-card deck plus 2 jokers
- **Real-time Communication**: WebSocket-based multiplayer using Socket.IO
- **Responsive UI**: Clean, modern interface that works on desktop and mobile

## Project Structure

```
multiplayer-card-game/
├── server/
│   ├── index.js      # Main server and socket handlers
│   ├── lobby.js      # Lobby management
│   ├── room.js       # Room management
│   └── deck.js       # Card deck implementation (54 cards)
├── public/
│   ├── index.html    # Main UI
│   ├── styles.css    # Styling
│   └── app.js        # Client-side JavaScript
├── package.json
└── README.md
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or use development mode with auto-restart:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Use

1. **Join Lobby**: Enter your name and join the lobby
2. **Create/Join Room**: Create a new room or join an existing one
3. **Wait for Players**: Wait for other players to join
4. **Start Game**: Host can start the game when ready (minimum 2 players)
5. **Play**: Game logic to be implemented in the next step

## Game Logic - Ready for Implementation

The project is structured and ready for you to add specific card game rules. The following components are prepared:

- **Deck System** ([server/deck.js](server/deck.js)): Full 54-card deck with shuffle, draw, and reset functions
- **Game State Management** ([server/room.js](server/room.js)): Room-based game state tracking
- **Real-time Events**: Socket.IO events for game actions
- **UI Components**: Game board and player hand display areas

### Next Steps

Add your specific card game logic by:
1. Implementing game rules in the server
2. Adding game action handlers
3. Updating the game UI to display cards and actions
4. Adding game-specific event handlers

## Technology Stack

- **Backend**: Node.js, Express
- **Real-time**: Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **UUID**: For unique room IDs

## Port

Default port: `3000`

You can change it by setting the `PORT` environment variable:
```bash
PORT=8080 npm start
```

## Game Implemented: Show (Minimize Hand Value) ✅

The first card game "Show (Minimize Hand Value)" has been fully implemented!

### Game Features
- 5 cards dealt to each player at game start
- Deck and discard pile management
- Turn-based gameplay
- Multiple card dropping (2-3 cards of same rank)
- Special rule: Same rank as discard = no card taken
- Show cards to end game and determine winner
- Real-time game state updates for all players

### How to Play
1. **Sign up / Login** to create an account
2. **Create or Join a Room** (2-6 players)
3. **Start the Game** (host only, minimum 2 players)
4. **Take Your Turn:**
   - Select cards from your hand (click to select/deselect)
   - Drop cards and take from deck or discard pile
   - Or show your cards to end the game if you think you have the lowest value
5. **Win** by having the lowest total card value when cards are shown!

See [GAME_RULES.md](GAME_RULES.md) for detailed game rules and strategy tips.

---

Ready to add more card games! The framework supports multiple game types.
