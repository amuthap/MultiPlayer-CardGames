let gameState = {
  room: null,
  yourHand: [],
  topCard: null,
  currentPlayer: null,
  selectedCards: [],
  deckCount: 54,
  players: [],
  handCounts: {},
  isYourTurn: false
};

let scoreboard = {}; // Track cumulative scores for each player across rounds

function getSuitSymbol(suit) {
  const symbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
    joker: '🃏'
  };
  return symbols[suit] || suit;
}

function createCardElement(card, selectable = false) {
  const cardDiv = document.createElement('div');
  cardDiv.className = `card ${card.suit}`;
  cardDiv.dataset.cardId = card.id;

  if (card.suit === 'joker') {
    cardDiv.innerHTML = `
      <div class="card-top">
        <div class="rank" style="font-size: 14px;">JOKER</div>
      </div>
      <div class="card-center">
        <div class="suit">🃏</div>
      </div>
      <div class="card-value">Value: 0</div>
    `;
  } else {
    cardDiv.innerHTML = `
      <div class="card-top">
        <div class="rank">${card.rank}</div>
        <div class="suit" style="font-size: 24px;">${getSuitSymbol(card.suit)}</div>
      </div>
      <div class="card-center">
        <div class="suit">${getSuitSymbol(card.suit)}</div>
      </div>
      <div class="card-value">Value: ${card.value}</div>
    `;
  }

  if (selectable) {
    cardDiv.addEventListener('click', () => toggleCardSelection(card.id));
  }

  return cardDiv;
}

function toggleCardSelection(cardId) {
  const index = gameState.selectedCards.indexOf(cardId);

  if (index > -1) {
    gameState.selectedCards.splice(index, 1);
  } else {
    gameState.selectedCards.push(cardId);
  }

  renderHand();
  updateActionButtons();
}

function calculateHandValue(hand) {
  return hand.reduce((sum, card) => sum + card.value, 0);
}

function renderHand() {
  const handCardsDiv = document.getElementById('hand-cards');
  handCardsDiv.innerHTML = '';

  console.log('Rendering hand. Cards:', gameState.yourHand);
  console.log('Number of cards:', gameState.yourHand.length);

  if (!gameState.yourHand || gameState.yourHand.length === 0) {
    handCardsDiv.innerHTML = '<p style="color: #666; text-align: center;">No cards in hand</p>';
    document.getElementById('hand-value').textContent = '0';
    return;
  }

  for (const card of gameState.yourHand) {
    const cardElement = createCardElement(card, gameState.isYourTurn);

    if (gameState.selectedCards.includes(card.id)) {
      cardElement.classList.add('selected');
    }

    handCardsDiv.appendChild(cardElement);
  }

  const handValue = calculateHandValue(gameState.yourHand);
  document.getElementById('hand-value').textContent = handValue;
}

function renderTopCard() {
  const discardArea = document.getElementById('discard-pile-area');
  discardArea.innerHTML = '';

  if (gameState.topCard) {
    const cardElement = createCardElement(gameState.topCard, false);
    discardArea.appendChild(cardElement);
  }
}

function renderOtherPlayers() {
  const otherPlayersDiv = document.getElementById('other-players');
  otherPlayersDiv.innerHTML = '';

  for (const player of gameState.players) {
    if (player.id === playerId) continue;

    const playerCard = document.createElement('div');
    playerCard.className = 'other-player-card';

    if (player.id === gameState.currentPlayer) {
      playerCard.classList.add('current-turn');
    }

    const cardCount = gameState.handCounts[player.id] || 0;

    playerCard.innerHTML = `
      <div class="player-name">${player.name}</div>
      <div class="card-count">${cardCount} card${cardCount !== 1 ? 's' : ''}</div>
    `;

    otherPlayersDiv.appendChild(playerCard);
  }
}

function updateActionButtons() {
  const isYourTurn = gameState.currentPlayer === playerId;
  const hasSelection = gameState.selectedCards.length > 0;

  document.getElementById('take-from-deck-btn').disabled = !isYourTurn || !hasSelection;
  document.getElementById('take-from-discard-btn').disabled = !isYourTurn || !hasSelection;
  document.getElementById('show-cards-btn').disabled = !isYourTurn;

  gameState.isYourTurn = isYourTurn;
}

function updateGameInfo(publicState) {
  if (publicState.currentPlayer) {
    const currentPlayerName = gameState.players.find(p => p.id === publicState.currentPlayer)?.name || '-';
    document.getElementById('current-player-name').textContent = currentPlayerName;

    gameState.currentPlayer = publicState.currentPlayer;
  }

  if (publicState.deckCount !== undefined) {
    document.getElementById('deck-count').textContent = publicState.deckCount;
    gameState.deckCount = publicState.deckCount;
  }

  if (publicState.topCard) {
    gameState.topCard = publicState.topCard;
    renderTopCard();
  }

  if (publicState.handCounts) {
    gameState.handCounts = publicState.handCounts;
  }

  renderOtherPlayers();
  updateActionButtons();
}

socket.on('game_started', (data) => {
  console.log('=== GAME STARTED ===');
  console.log('Full data received:', data);
  console.log('Your hand:', data.yourHand);
  console.log('Game state:', data.gameState);
  console.log('Room:', data.room);

  if (!data.yourHand) {
    console.error('ERROR: yourHand is undefined!');
    showNotification('Error: No cards received from server', 'error');
    return;
  }

  gameState.room = data.room;
  gameState.yourHand = data.yourHand;
  gameState.players = data.room.players;
  gameState.topCard = data.gameState.topCard;
  gameState.currentPlayer = data.gameState.currentPlayer;
  gameState.deckCount = data.gameState.deckCount;
  gameState.selectedCards = [];

  console.log('gameState.yourHand set to:', gameState.yourHand);

  // Initialize hand counts
  gameState.handCounts = {};
  for (const player of data.room.players) {
    gameState.handCounts[player.id] = 5; // Everyone starts with 5 cards
  }

  showScreen('game');
  showNotification('Game started!', 'success');

  // Update action buttons first to set isYourTurn before rendering hand
  updateActionButtons();
  console.log('About to render hand...');
  renderHand();
  renderTopCard();
  renderOtherPlayers();
  console.log('=== RENDER COMPLETE ===');
});

socket.on('game_state_update', (data) => {
  console.log('Game state update:', data);
  if (data.publicState.handCounts) {
    gameState.handCounts = data.publicState.handCounts;
  }
  updateGameInfo(data.publicState);
});

socket.on('cards_dropped', (data) => {
  gameState.yourHand = data.yourHand;
  gameState.selectedCards = [];

  updateGameInfo(data.publicState);
  renderHand();

  const droppedCardsText = data.result.droppedCards.map(c => `${c.rank}${getSuitSymbol(c.suit)}`).join(', ');
  const message = data.result.cardTaken
    ? `Cards dropped: ${droppedCardsText}. Took: ${data.result.cardTaken.rank}${getSuitSymbol(data.result.cardTaken.suit)}`
    : `Cards dropped: ${droppedCardsText}. Same rank - no card taken!`;

  showNotification(message, 'info');
});

socket.on('game_ended', (data) => {
  showGameResult(data.result);
});

function showGameResult(result) {
  // Calculate sum of ALL players' hand values (including everyone)
  let sumOfAllScores = 0;
  for (const playerResult of result.results) {
    sumOfAllScores += playerResult.value;
  }

  // Store current round scores for display
  const currentRoundScores = {};

  // Update scoreboard with new scoring system
  for (const playerResult of result.results) {
    if (!scoreboard[playerResult.playerId]) {
      scoreboard[playerResult.playerId] = {
        totalScore: 0,
        rounds: 0,
        wins: 0,
        name: playerResult.playerName
      };
    }

    // New scoring system:
    // - Winner (who showed cards and had lowest) gets 0 points
    // - Loser (who showed cards but didn't have lowest) gets sum of ALL players' scores
    // - Other players get their actual hand values
    let scoreToAdd;
    if (playerResult.playerId === result.winner) {
      scoreToAdd = 0; // Winner gets 0
    } else if (playerResult.playerId === result.loser) {
      scoreToAdd = sumOfAllScores; // Loser gets sum of ALL players
    } else {
      scoreToAdd = playerResult.value; // Others get their hand value
    }

    scoreboard[playerResult.playerId].totalScore += scoreToAdd;
    scoreboard[playerResult.playerId].rounds++;
    scoreboard[playerResult.playerId].name = playerResult.playerName;

    // Track wins
    if (playerResult.playerId === result.winner) {
      scoreboard[playerResult.playerId].wins++;
    }

    // Store this round's score
    currentRoundScores[playerResult.playerId] = scoreToAdd;
  }

  // Render scoreboard with current round scores
  renderScoreboard(currentRoundScores);

  const modal = document.getElementById('game-result-modal');
  const titleEl = document.getElementById('result-title');
  const contentEl = document.getElementById('result-content');

  titleEl.textContent = result.message;

  let html = '<h3 style="margin-top: 20px;">This Round Results:</h3><div>';

  for (const playerResult of result.results) {
    const isWinner = playerResult.playerId === result.winner;
    const isLoser = playerResult.playerId === result.loser;
    const className = isWinner ? 'winner' : (isLoser ? 'loser' : '');

    // Calculate points added for this player
    let pointsAdded;
    if (isWinner) {
      pointsAdded = 0;
    } else if (isLoser) {
      pointsAdded = sumOfAllScores;
    } else {
      pointsAdded = playerResult.value;
    }

    html += `
      <div class="result-player ${className}">
        <div>
          <strong>${playerResult.playerName}</strong>
          ${isWinner ? '👑 WINNER' : (isLoser ? '❌ LOST' : '')}
          <br>
          <span>Hand Value: ${playerResult.value}</span>
          <br>
          <span style="color: ${isWinner ? '#28a745' : (isLoser ? '#dc3545' : '#667eea')}; font-weight: bold;">
            Points Added: ${pointsAdded}
          </span>
        </div>
        <div class="result-player-cards">
          ${playerResult.hand.map(card => `
            <div class="result-card ${card.suit}">
              <div class="rank">${card.rank}</div>
              <div class="suit">${getSuitSymbol(card.suit)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  html += '</div>';
  contentEl.innerHTML = html;

  modal.classList.add('active');
}

function renderScoreboard(currentRoundScores = {}) {
  const scoreboardEl = document.getElementById('scoreboard');

  // Convert to array and sort by lowest total score (best player has lowest cumulative hand values)
  const players = Object.entries(scoreboard).map(([id, data]) => ({
    id,
    ...data
  })).sort((a, b) => a.totalScore - b.totalScore);

  let html = '';

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const isLeading = i === 0 && player.rounds > 0;
    const avgScore = player.rounds > 0 ? (player.totalScore / player.rounds).toFixed(1) : 0;
    const currentScore = currentRoundScores[player.id] !== undefined ? currentRoundScores[player.id] : '-';

    html += `
      <div class="scoreboard-player ${isLeading ? 'leading' : ''}">
        <div class="player-name">
          ${isLeading ? '🏆' : ''}
          ${player.name}
        </div>
        <div class="player-stats">
          <div class="stat">
            <span class="stat-label">This Round</span>
            <span class="stat-value" style="color: ${currentScore === 0 ? '#28a745' : '#667eea'};">${currentScore}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Total Score</span>
            <span class="stat-value">${player.totalScore}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Avg Score</span>
            <span class="stat-value">${avgScore}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Wins</span>
            <span class="stat-value">${player.wins}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Rounds</span>
            <span class="stat-value">${player.rounds}</span>
          </div>
        </div>
      </div>
    `;
  }

  scoreboardEl.innerHTML = html;
}

document.getElementById('close-result-btn').addEventListener('click', () => {
  document.getElementById('game-result-modal').classList.remove('active');
  exitGameToLobby();
});

document.getElementById('exit-game-btn').addEventListener('click', () => {
  const modal = document.getElementById('confirm-exit-modal');
  modal.classList.add('active');
});

document.getElementById('confirm-exit-yes').addEventListener('click', () => {
  const modal = document.getElementById('confirm-exit-modal');
  modal.classList.remove('active');
  exitGameToLobby();
});

document.getElementById('confirm-exit-no').addEventListener('click', () => {
  const modal = document.getElementById('confirm-exit-modal');
  modal.classList.remove('active');
});

function exitGameToLobby() {
  // Leave the current room
  if (currentRoom) {
    socket.emit('leave_room', currentRoom.id);
  }

  // Reset game state
  gameState = {
    room: null,
    yourHand: [],
    topCard: null,
    currentPlayer: null,
    selectedCards: [],
    deckCount: 54,
    players: [],
    handCounts: {},
    isYourTurn: false
  };

  // The server will emit 'returned_to_lobby' event which will handle showing lobby screen
}

document.getElementById('play-again-btn').addEventListener('click', () => {
  document.getElementById('game-result-modal').classList.remove('active');
  socket.emit('play_again', {
    roomId: currentRoom.id
  });
  showNotification('Waiting for other players to start new round...', 'info');
});

document.getElementById('take-from-deck-btn').addEventListener('click', () => {
  if (gameState.selectedCards.length === 0) {
    showNotification('Please select cards to drop', 'error');
    return;
  }

  socket.emit('drop_cards', {
    roomId: currentRoom.id,
    cardIds: gameState.selectedCards,
    takeFromDeck: true
  });
});

document.getElementById('take-from-discard-btn').addEventListener('click', () => {
  if (gameState.selectedCards.length === 0) {
    showNotification('Please select cards to drop', 'error');
    return;
  }

  socket.emit('drop_cards', {
    roomId: currentRoom.id,
    cardIds: gameState.selectedCards,
    takeFromDeck: false
  });
});

document.getElementById('show-cards-btn').addEventListener('click', () => {
  const modal = document.getElementById('confirm-show-modal');
  modal.classList.add('active');
});

document.getElementById('confirm-show-yes').addEventListener('click', () => {
  const modal = document.getElementById('confirm-show-modal');
  modal.classList.remove('active');
  socket.emit('show_cards', {
    roomId: currentRoom.id
  });
});

document.getElementById('confirm-show-no').addEventListener('click', () => {
  const modal = document.getElementById('confirm-show-modal');
  modal.classList.remove('active');
});
