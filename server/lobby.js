export class LobbyManager {
  constructor() {
    this.players = new Map();
  }

  addPlayer(id, name) {
    const player = {
      id,
      name: name || `Player_${id.substring(0, 6)}`,
      joinedAt: Date.now()
    };
    this.players.set(id, player);
    return player;
  }

  removePlayer(id) {
    return this.players.delete(id);
  }

  getPlayer(id) {
    return this.players.get(id);
  }

  getPlayers() {
    return Array.from(this.players.values());
  }

  getPlayerCount() {
    return this.players.size;
  }
}
