# Testing Guide - Reduce Cards Game

## How to Test the Game

### Server Status
Server should be running on **http://localhost:3000**

If not, run:
```bash
node server/index.js
```

## Step-by-Step Testing

### 1. Create Two Players (Minimum)

**Player 1:**
1. Open browser at http://localhost:3000
2. Click "Sign Up" tab
3. Create account:
   - Username: `player1`
   - Display Name: `Alice`
   - Password: `password123`
4. Click "Sign Up" button
5. Switch to "Login" tab
6. Login with username `player1` and password `password123`

**Player 2:**
1. Open a **new browser tab/window** or **incognito window**
2. Go to http://localhost:3000
3. Click "Sign Up" tab
4. Create account:
   - Username: `player2`
   - Display Name: `Bob`
   - Password: `password123`
5. Login with username `player2` and password `password123`

### 2. Create and Join a Room

**Player 1 (Alice):**
1. Click "Create Room" button
2. Enter room details:
   - Room Name: `Test Game`
   - Max Players: `4`
   - Game Type: `Reduce Cards`
3. Click "Create"
4. Wait in room for Player 2

**Player 2 (Bob):**
1. You should see "Test Game" in the available rooms list
2. Click "Join" button next to it
3. You should now be in the room with Alice

### 3. Start the Game

**Player 1 (Alice - Host):**
1. Click "Start Game" button
2. Game screen should appear with:
   - Your 5 cards displayed at bottom
   - Top discard card shown in center
   - Deck pile on left
   - Other players' card counts shown at top
   - Current turn indicator

### 4. Play the Game

**Taking Your Turn (when it's your turn):**

1. **Select cards to drop:**
   - Click on card(s) in your hand
   - Selected cards will lift up and change color
   - Can select 1 card, or 2-3 cards of the same rank (e.g., three 7s)

2. **Drop and take a card:**
   - Click "Drop & Take from Deck" to get a random card
   - OR click "Drop & Take Discard" to take the visible discard card
   - Special: If you drop same rank as discard, you won't take any card!

3. **End the game (when confident):**
   - Click "Show Cards (End Game)" button
   - All players reveal their hands
   - Lowest total value wins!
   - If someone has lower value, you lose!

### 5. Test Cases to Verify

✅ **Basic Turn:**
- Drop 1 card, take from deck
- Verify next player's turn

✅ **Same Rank Rule:**
- Drop a card that matches the discard pile rank
- Should NOT take a card back
- Hand size should decrease by 1

✅ **Multiple Cards:**
- Drop 2 or 3 cards of same rank (e.g., 3 Kings)
- Should only take 1 card back
- Net reduction in hand size

✅ **Take from Discard:**
- Drop a card
- Click "Take Discard"
- Should get the card that was previously on top (not your own card)

✅ **End Game - Win:**
- Get low-value cards (Aces, 2s, 3s)
- Click "Show Cards"
- If you have lowest value, you win!

✅ **End Game - Lose:**
- Click "Show Cards" when you don't have lowest value
- Should show you lost
- All hands revealed with values

### 6. Check Browser Console

Open browser DevTools (F12) and check Console for:
- `Game started data:` - Should show game initialization
- `Game state update:` - Should show state updates
- Any error messages

## Common Issues and Solutions

### Game doesn't start
- Make sure you have at least 2 players in the room
- Only the HOST can start the game
- Check browser console for errors

### Cards don't show
- Refresh the page (Ctrl+F5)
- Check that server is running
- Verify you're logged in

### Can't select cards
- Make sure it's your turn (name highlighted at top)
- Only the current player can select cards
- Buttons will be enabled when it's your turn

### Server not responding
- Restart server: Stop with Ctrl+C, then run `node server/index.js`
- Check port 3000 is not in use by another application

## Expected Game Flow

```
1. Players join room
2. Host starts game
3. Each player gets 5 cards
4. One card placed face-up on discard pile
5. Player 1's turn:
   - Select card(s)
   - Drop and take (or don't take if same rank)
6. Player 2's turn:
   - Same as above
7. Continue until someone shows cards
8. Game ends, winner announced
```

## Success Criteria

- ✅ Can create account and login
- ✅ Can create and join rooms
- ✅ Game starts with 5 cards each
- ✅ Can drop cards and take cards
- ✅ Same rank rule works (no card taken)
- ✅ Multiple card drop works (2-3 same rank)
- ✅ Turn passes to next player
- ✅ Can take from deck or discard pile
- ✅ Show cards ends game correctly
- ✅ Winner/loser determined correctly
- ✅ All hands revealed at end

Enjoy testing! 🎮
