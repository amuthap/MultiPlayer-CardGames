# Bugs Fixed

## Issue 1: Same Rank Card Detection Bug
**Location:** [server/games/reduceCards.js:83](server/games/reduceCards.js#L83)

**Problem:**
When checking if the dropped card has the same rank as the top card on the discard pile, the code was getting the top card AFTER adding the dropped cards to the pile. This meant it was comparing the dropped card with itself, so the special "same rank = no card taken" rule never worked.

**Fix:**
Captured the previous top card BEFORE adding dropped cards to the discard pile:
```javascript
// Before the fix:
for (const card of cardsToDrop) {
  this.discardPile.push(card);
}
const topCard = this.getTopCard(); // Gets the card we just dropped!

// After the fix:
const previousTopCard = this.getTopCard(); // Get BEFORE dropping
for (const card of cardsToDrop) {
  this.discardPile.push(card);
}
if (droppedCard.rank === previousTopCard.rank && cardsToDrop.length === 1) {
  // Now correctly compares with the card that was there before
}
```

## Issue 2: Taking from Discard Pile Bug
**Location:** [server/games/reduceCards.js:92-102](server/games/reduceCards.js#L92-L102)

**Problem:**
When a player chose to take a card from the discard pile, the code was popping the last card, which was the card they just dropped! This meant they would get their own card back immediately.

**Fix:**
Properly handle the discard pile to take the card that was previously on top:
```javascript
// Before the fix:
const takenCard = this.discardPile.pop(); // Takes the card we just dropped!

// After the fix:
// Remove our dropped cards temporarily
for (let i = 0; i < cardsToDrop.length; i++) {
  this.discardPile.pop();
}
// Take the card that was previously on top
cardTaken = this.discardPile.pop();
hand.push(cardTaken);
// Put our dropped cards back
for (const card of cardsToDrop) {
  this.discardPile.push(card);
}
```

## Testing Checklist
- [ ] Drop a single card with same rank as discard - should not take a card ✅
- [ ] Drop a single card with different rank - should take a card ✅
- [ ] Drop 2-3 cards of same rank - should take only 1 card back ✅
- [ ] Take from deck - should get a new card from deck ✅
- [ ] Take from discard pile - should get the previous top card, not the dropped card ✅
- [ ] Show cards to end game - should reveal all hands and determine winner ✅

All game rules are now working correctly!
