const socket = io();

let currentScreen = 'login';
let currentRoom = null;
let playerName = '';
let playerId = '';
let playerData = null;

const screens = {
  login: document.getElementById('login-screen'),
  lobby: document.getElementById('lobby-screen'),
  room: document.getElementById('room-screen'),
  game: document.getElementById('game-screen')
};

function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
  currentScreen = screenName;
}

function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type} show`;

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

document.getElementById('login-tab').addEventListener('click', () => {
  document.getElementById('login-tab').classList.add('active');
  document.getElementById('signup-tab').classList.remove('active');
  document.getElementById('login-form').classList.add('active');
  document.getElementById('signup-form').classList.remove('active');
});

document.getElementById('signup-tab').addEventListener('click', () => {
  document.getElementById('signup-tab').classList.add('active');
  document.getElementById('login-tab').classList.remove('active');
  document.getElementById('signup-form').classList.add('active');
  document.getElementById('login-form').classList.remove('active');
});

document.getElementById('login-btn').addEventListener('click', () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  socket.emit('login', { username, password });
});

document.getElementById('signup-btn').addEventListener('click', () => {
  const username = document.getElementById('signup-username').value.trim();
  const displayName = document.getElementById('signup-displayname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  if (!username || !displayName || !password || !confirmPassword) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  if (username.length < 3) {
    showNotification('Username must be at least 3 characters', 'error');
    return;
  }

  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }

  socket.emit('signup', { username, displayName, email: email || null, password });
});

document.getElementById('login-password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('login-btn').click();
  }
});

document.getElementById('signup-confirm-password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('signup-btn').click();
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  socket.emit('logout');
  playerData = null;
  playerName = '';
  showScreen('login');
  showNotification('Logged out successfully', 'info');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
});

socket.on('signup_success', (data) => {
  showNotification('Account created! Please login.', 'success');
  document.getElementById('signup-tab').classList.remove('active');
  document.getElementById('login-tab').classList.add('active');
  document.getElementById('signup-form').classList.remove('active');
  document.getElementById('login-form').classList.add('active');
  document.getElementById('signup-username').value = '';
  document.getElementById('signup-displayname').value = '';
  document.getElementById('signup-email').value = '';
  document.getElementById('signup-password').value = '';
  document.getElementById('signup-confirm-password').value = '';
});

socket.on('login_success', (data) => {
  playerData = data.player;
  playerName = data.player.displayName;
  playerId = socket.id;

  document.getElementById('logged-in-user').textContent = `Welcome, ${playerName}!`;

  socket.emit('join_lobby', playerName);
});

socket.on('lobby_joined', (data) => {
  playerId = data.playerId;
  showScreen('lobby');
  showNotification(`Joined lobby!`, 'success');
  updateRoomsList(data.rooms);
});

socket.on('lobby_update', (data) => {
  if (currentScreen === 'lobby') {
    updateRoomsList(data.rooms);
    updatePlayersList(data.players);
  }
});

function updateRoomsList(rooms) {
  const roomsList = document.getElementById('rooms-list');

  if (rooms.length === 0) {
    roomsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No rooms available. Create one!</p>';
    return;
  }

  roomsList.innerHTML = rooms.map(room => {
    const isFull = room.currentPlayers >= room.maxPlayers;
    const status = room.gameStarted ? 'playing' : (isFull ? 'full' : 'waiting');
    const statusText = room.gameStarted ? 'Playing' : (isFull ? 'Full' : 'Waiting');

    return `
      <div class="room-item" data-room-id="${room.id}">
        <div class="room-info-text">
          <h3>${room.name}</h3>
          <p>Host: ${room.host.name} | Players: ${room.currentPlayers}/${room.maxPlayers} | Type: ${room.gameType}</p>
        </div>
        <div>
          <span class="room-status ${status}">${statusText}</span>
          ${!isFull && !room.gameStarted ? `<button class="btn-primary" style="margin-left: 10px;" onclick="joinRoom('${room.id}')">Join</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function updatePlayersList(players) {
  const playersList = document.getElementById('players-list');
  const playerCount = document.getElementById('player-count');

  playerCount.textContent = players.length;

  if (players.length === 0) {
    playersList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No players in lobby</p>';
    return;
  }

  playersList.innerHTML = players.map(player => `
    <div class="player-item">
      <div class="player-icon">${player.name.charAt(0).toUpperCase()}</div>
      <span>${player.name}</span>
    </div>
  `).join('');
}

document.getElementById('create-room-btn').addEventListener('click', () => {
  document.getElementById('create-room-modal').classList.add('active');
});

document.getElementById('cancel-create-room-btn').addEventListener('click', () => {
  document.getElementById('create-room-modal').classList.remove('active');
});

document.getElementById('confirm-create-room-btn').addEventListener('click', () => {
  const roomName = document.getElementById('room-name').value.trim() || `${playerName}'s Room`;
  const maxPlayers = parseInt(document.getElementById('max-players').value);
  const gameType = document.getElementById('game-type').value;

  socket.emit('create_room', { roomName, maxPlayers, gameType });
  document.getElementById('create-room-modal').classList.remove('active');
  document.getElementById('room-name').value = '';
});

function joinRoom(roomId) {
  socket.emit('join_room', roomId);
}

socket.on('room_created', (data) => {
  currentRoom = data.room;
  showScreen('room');
  updateRoomScreen(data.room);
  showNotification('Room created successfully!', 'success');
});

socket.on('room_joined', (data) => {
  currentRoom = data.room;
  showScreen('room');
  updateRoomScreen(data.room);
  showNotification('Joined room successfully!', 'success');
});

socket.on('room_update', (data) => {
  if (currentScreen === 'room') {
    currentRoom = data.room;
    updateRoomScreen(data.room);
  }
});

function updateRoomScreen(room) {
  document.getElementById('room-title').textContent = room.name;
  document.getElementById('room-host').textContent = room.host.name;
  document.getElementById('room-player-count').textContent = room.players.length;
  document.getElementById('room-max-players').textContent = room.maxPlayers;
  document.getElementById('room-game-type').textContent = room.gameType;

  const roomPlayers = document.getElementById('room-players');
  roomPlayers.innerHTML = room.players.map(player => `
    <div class="room-player-card ${player.isHost ? 'host' : ''}">
      <div class="player-icon">${player.name.charAt(0).toUpperCase()}</div>
      <p><strong>${player.name}</strong></p>
      ${player.isHost ? '<p style="color: #667eea; font-size: 12px;">HOST</p>' : ''}
    </div>
  `).join('');

  const startBtn = document.getElementById('start-game-btn');
  if (room.host.id === playerId) {
    startBtn.style.display = 'block';
  } else {
    startBtn.style.display = 'none';
  }
}

document.getElementById('leave-room-btn').addEventListener('click', () => {
  if (currentRoom) {
    socket.emit('leave_room', currentRoom.id);
  }
});

socket.on('returned_to_lobby', (data) => {
  console.log('=== RETURNED TO LOBBY ===');
  console.log('Data received:', data);
  currentRoom = null;
  showScreen('lobby');
  updateRoomsList(data.rooms);
  showNotification('Returned to lobby', 'info');
  console.log('=== LOBBY SCREEN SHOWN ===');
});

document.getElementById('start-game-btn').addEventListener('click', () => {
  if (currentRoom) {
    socket.emit('start_game', currentRoom.id);
  }
});

// Game started handler is in game.js

document.getElementById('exit-game-btn').addEventListener('click', () => {
  if (currentRoom) {
    socket.emit('leave_room', currentRoom.id);
  }
});

socket.on('error', (data) => {
  showNotification(data.message, 'error');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server. Reason:', reason);

  if (reason === 'io server disconnect') {
    // Server forcefully disconnected
    showNotification('Server disconnected you. Please refresh and login again.', 'error');
    setTimeout(() => {
      showScreen('login');
      currentRoom = null;
    }, 3000);
  } else {
    // Client lost connection
    showNotification('Connection lost. Attempting to reconnect...', 'error');
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
  // If we were in a game and reconnected, show notification
  if (currentScreen !== 'login' && currentScreen !== 'lobby') {
    showNotification('Reconnected to server!', 'success');
  }
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  showNotification('Cannot connect to server. Is it running?', 'error');
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  showNotification('Reconnected successfully!', 'success');
});

socket.on('reconnect_failed', () => {
  showNotification('Failed to reconnect. Please refresh the page.', 'error');
});
