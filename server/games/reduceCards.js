export class ReduceCardsGame {
  constructor(room) {
    this.room = room;
    this.deck = room.deck;
    this.playerHands = {};
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.gameStarted = false;
    this.gameEnded = false;
    this.winner = null;
  }

  initializeGame() {
    this.deck.shuffle();

    for (const player of this.room.players) {
      this.playerHands[player.id] = this.deck.draw(5);
    }

    const firstCard = this.deck.drawOne();
    this.discardPile.push(firstCard);

    this.gameStarted = true;
    this.currentPlayerIndex = 0;

    return {
      success: true,
      playerHands: this.playerHands,
      topCard: firstCard,
      currentPlayer: this.room.players[0].id,
      deckCount: this.deck.getCount()
    };
  }

  getCurrentPlayer() {
    return this.room.players[this.currentPlayerIndex];
  }

  getTopCard() {
    return this.discardPile[this.discardPile.length - 1];
  }

  calculateHandValue(hand) {
    return hand.reduce((sum, card) => sum + card.value, 0);
  }

  canDropCards(cards) {
    if (cards.length === 0) return false;
    if (cards.length === 1) return true;

    const firstRank = cards[0].rank;
    return cards.every(card => card.rank === firstRank);
  }

  dropCards(playerId, cardIds, takeFromDeck = true) {
    if (this.getCurrentPlayer().id !== playerId) {
      return { success: false, message: 'Not your turn' };
    }

    const hand = this.playerHands[playerId];
    const cardsToDrop = hand.filter(card => cardIds.includes(card.id));

    if (cardsToDrop.length !== cardIds.length) {
      return { success: false, message: 'Invalid cards' };
    }

    if (!this.canDropCards(cardsToDrop)) {
      return { success: false, message: 'Cards must have the same rank' };
    }

    const previousTopCard = this.getTopCard();
    const droppedCard = cardsToDrop[0];

    for (const card of cardsToDrop) {
      const index = hand.findIndex(c => c.id === card.id);
      if (index !== -1) {
        hand.splice(index, 1);
        this.discardPile.push(card);
      }
    }
    let cardTaken = null;

    if (droppedCard.rank === previousTopCard.rank && cardsToDrop.length === 1) {
      // Same rank - no need to take a card
    } else {
      if (takeFromDeck) {
        if (this.deck.getCount() > 0) {
          cardTaken = this.deck.drawOne();
          hand.push(cardTaken);
        }
      } else {
        // Take the card that was previously on top (not the one we just dropped)
        // We need to remove our dropped cards first, then take the top
        for (let i = 0; i < cardsToDrop.length; i++) {
          this.discardPile.pop();
        }
        cardTaken = this.discardPile.pop();
        hand.push(cardTaken);
        // Put our dropped cards back
        for (const card of cardsToDrop) {
          this.discardPile.push(card);
        }
      }
    }

    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.room.players.length;

    return {
      success: true,
      droppedCards: cardsToDrop,
      cardTaken,
      topCard: this.getTopCard(),
      nextPlayer: this.getCurrentPlayer().id,
      deckCount: this.deck.getCount()
    };
  }

  showCards(playerId) {
    if (this.getCurrentPlayer().id !== playerId) {
      return { success: false, message: 'Not your turn' };
    }

    const playerHand = this.playerHands[playerId];
    const playerValue = this.calculateHandValue(playerHand);

    const results = [];
    let hasLowerValue = false;

    for (const player of this.room.players) {
      const handValue = this.calculateHandValue(this.playerHands[player.id]);
      results.push({
        playerId: player.id,
        playerName: player.name,
        hand: this.playerHands[player.id],
        value: handValue
      });

      if (player.id !== playerId && handValue < playerValue) {
        hasLowerValue = true;
      }
    }

    this.gameEnded = true;

    if (hasLowerValue) {
      this.winner = null;
      return {
        success: false,
        message: `${this.room.players.find(p => p.id === playerId).name} lost! Someone has a lower value.`,
        results,
        loser: playerId
      };
    } else {
      this.winner = playerId;
      return {
        success: true,
        message: `${this.room.players.find(p => p.id === playerId).name} wins!`,
        results,
        winner: playerId
      };
    }
  }

  getGameState() {
    return {
      playerHands: this.playerHands,
      topCard: this.getTopCard(),
      currentPlayer: this.getCurrentPlayer().id,
      deckCount: this.deck.getCount(),
      gameStarted: this.gameStarted,
      gameEnded: this.gameEnded,
      winner: this.winner
    };
  }

  getPlayerHand(playerId) {
    return this.playerHands[playerId] || [];
  }

  getPublicGameState() {
    const handCounts = {};
    for (const playerId in this.playerHands) {
      handCounts[playerId] = this.playerHands[playerId].length;
    }

    return {
      handCounts,
      topCard: this.getTopCard(),
      currentPlayer: this.getCurrentPlayer().id,
      deckCount: this.deck.getCount(),
      gameStarted: this.gameStarted,
      gameEnded: this.gameEnded
    };
  }
}
