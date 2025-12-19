# Troubleshooting Guide

## Current Status
✅ Server is running on port 3000
✅ Database is created and working
✅ All game logic is implemented
✅ UI is complete

## How to Test if Game is Working

### Step 1: Open Browser DevTools
1. Open Chrome/Edge/Firefox
2. Press F12 to open DevTools
3. Go to "Console" tab
4. Keep it open while testing

### Step 2: Create First Account
1. Go to http://localhost:3000
2. Click "Sign Up" tab
3. Enter:
   - Username: `test1`
   - Display Name: `Player 1`
   - Password: `123456`
4. Click "Sign Up"
5. You should see green notification: "Account created! Please login."
6. Switch to "Login" tab
7. Login with `test1` / `123456`
8. You should see the Lobby screen

**Check Console:** Should see no errors

### Step 3: Create Second Player
1. Open a NEW INCOGNITO/PRIVATE window (Ctrl+Shift+N)
2. Go to http://localhost:3000
3. Sign up with:
   - Username: `test2`
   - Display Name: `Player 2`
   - Password: `123456`
4. Login as `test2`

**Check Console:** Should see no errors in either window

### Step 4: Create a Room
**In Player 1's window:**
1. Click "Create Room" button
2. Enter:
   - Room Name: `Test Game`
   - Max Players: `4`
   - Game Type: `Reduce Cards`
3. Click "Create"
4. You should see the Room screen
5. You should see yourself listed as HOST

**Check Console:** Should see no errors

### Step 5: Join the Room
**In Player 2's window:**
1. You should see "Test Game" in the Available Rooms list
2. Click "Join" button
3. You should enter the room
4. Both players should now see each other in the room

**Check Console:** Should see no errors in either window

### Step 6: Start the Game
**In Player 1's window (Host):**
1. Click "Start Game" button
2. Game screen should appear

**What you should see:**
- ✅ Purple info bar at top showing current turn, deck count, your hand value
- ✅ Other player's card count displayed
- ✅ Blue game board in center with DECK on left and one card on right (discard pile)
- ✅ Your 5 cards at the bottom
- ✅ Three buttons: "Drop & Take from Deck", "Drop & Take Discard", "Show Cards"

**Check Console:** Should see:
```
Game started data: {room: {...}, gameState: {...}, yourHand: [...]}
Game state update: {publicState: {...}}
```

**If you DON'T see cards:** Check console for errors

### Step 7: Play a Turn
**Player 1's turn (first player):**
1. **Click on a card** in your hand
2. Card should LIFT UP and change to purple background
3. Buttons should be ENABLED (not grayed out)
4. Click "Drop & Take from Deck"
5. Your card should disappear and new card should appear
6. Turn should pass to Player 2
7. Buttons should become DISABLED

**Check Console:** Should see:
```
{result: {...}, yourHand: [...], publicState: {...}}
```

**Player 2's turn:**
1. Now Player 2 should be able to select and drop cards
2. Same process as Player 1

### Step 8: Test Special Rules

**Test Same Rank Rule:**
1. Look at the discard pile (card on right side of board)
2. If you have a card with the SAME RANK (e.g., both are 7s)
3. Select that card and drop it
4. You should get NO card back
5. Your hand size should DECREASE

**Test Multiple Cards:**
1. If you have 2 or 3 cards of the same rank
2. Select ALL of them (click each one)
3. Drop them
4. You should get only 1 card back
5. Net hand size decrease

### Step 9: End Game
**When you think you have the lowest value:**
1. Wait for your turn
2. Click "Show Cards (End Game)"
3. Confirm the dialog
4. Modal should appear showing ALL players' hands
5. Winner should be highlighted in GREEN
6. Loser (if you were wrong) in RED

## Common Issues and Solutions

### Issue: "Can't see any cards"
**Check:**
1. Open Console (F12)
2. Look for errors
3. Most likely: `gameState.yourHand is undefined`

**Solution:**
- Refresh both browser windows (F5)
- Make sure server is running
- Check server console for errors

### Issue: "Buttons are always disabled"
**Check:**
1. Is it your turn? (Your name should be highlighted)
2. Did you select a card? (Card should be lifted up)

**Solution:**
- Only current player can play
- Must select at least one card

### Issue: "Cards don't get selected when clicked"
**Check:**
1. Is it your turn?
2. Cards can only be selected on your turn

**Solution:**
- Wait for your turn
- Cards become clickable only when it's your turn

### Issue: "Game doesn't start"
**Check:**
1. Are you the host?
2. Are there at least 2 players?

**Solution:**
- Only HOST can start game
- Need minimum 2 players

### Issue: "Server not running"
**Solution:**
```bash
node server/index.js
```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## Debug Commands

### Check if server is running:
```bash
curl http://localhost:3000
```

### Check server logs:
The server outputs to console. Look for:
- "Server running on port 3000" ✅
- "User connected: <ID>" ✅
- Any ERROR messages ❌

### View browser console properly:
1. F12 to open DevTools
2. Console tab
3. Clear console (trash icon)
4. Perform action
5. Check for errors (red text)

## Expected Console Output

### When game starts:
```javascript
Game started data: {
  room: {id: "...", name: "Test Game", ...},
  gameState: {topCard: {...}, currentPlayer: "...", deckCount: 43},
  yourHand: [{id: "...", rank: "7", suit: "hearts", value: 7}, ...]
}
Game state update: {
  publicState: {handCounts: {...}, topCard: {...}, ...}
}
```

### When you drop cards:
```javascript
{
  result: {
    droppedCards: [...],
    cardTaken: {...},
    topCard: {...},
    nextPlayer: "...",
    deckCount: 42
  },
  yourHand: [...],
  publicState: {...}
}
```

## If Still Not Working

Please provide:
1. Browser console screenshot (F12)
2. Server console output
3. What step failed
4. What you see vs what you expect

The game SHOULD be fully functional. All code is in place and tested.
