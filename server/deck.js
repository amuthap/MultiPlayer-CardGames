export class Deck {
  constructor() {
    this.cards = [];
    this.initializeDeck();
  }

  initializeDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push({
          suit,
          rank,
          value: this.getRankValue(rank),
          id: `${rank}_${suit}`
        });
      }
    }

    this.cards.push({
      suit: 'joker',
      rank: 'Joker',
      value: 0,
      id: 'joker_1',
      color: 'red'
    });

    this.cards.push({
      suit: 'joker',
      rank: 'Joker',
      value: 0,
      id: 'joker_2',
      color: 'black'
    });
  }

  getRankValue(rank) {
    const values = {
      'A': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      'J': 11,
      'Q': 12,
      'K': 13
    };
    return values[rank] || 0;
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(count = 1) {
    return this.cards.splice(0, count);
  }

  drawOne() {
    return this.cards.shift();
  }

  getCount() {
    return this.cards.length;
  }

  reset() {
    this.cards = [];
    this.initializeDeck();
  }

  peek(count = 1) {
    return this.cards.slice(0, count);
  }
}
