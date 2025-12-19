import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../data/players.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    display_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0
  )
`);

export class PlayerDB {
  static async signup(username, password, displayName, email = null) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const stmt = db.prepare(`
        INSERT INTO players (username, password, display_name, email)
        VALUES (?, ?, ?, ?)
      `);

      const result = stmt.run(username, hashedPassword, displayName, email);

      return {
        success: true,
        playerId: result.lastInsertRowid,
        message: 'Player created successfully'
      };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return {
          success: false,
          message: 'Username or email already exists'
        };
      }
      return {
        success: false,
        message: 'Error creating player: ' + error.message
      };
    }
  }

  static async login(username, password) {
    try {
      const stmt = db.prepare('SELECT * FROM players WHERE username = ?');
      const player = stmt.get(username);

      if (!player) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      const passwordMatch = await bcrypt.compare(password, player.password);

      if (!passwordMatch) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      const updateStmt = db.prepare('UPDATE players SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
      updateStmt.run(player.id);

      return {
        success: true,
        player: {
          id: player.id,
          username: player.username,
          displayName: player.display_name,
          email: player.email,
          gamesPlayed: player.games_played,
          gamesWon: player.games_won
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error logging in: ' + error.message
      };
    }
  }

  static getPlayer(playerId) {
    const stmt = db.prepare('SELECT * FROM players WHERE id = ?');
    const player = stmt.get(playerId);

    if (!player) return null;

    return {
      id: player.id,
      username: player.username,
      displayName: player.display_name,
      email: player.email,
      gamesPlayed: player.games_played,
      gamesWon: player.games_won,
      createdAt: player.created_at,
      lastLogin: player.last_login
    };
  }

  static updateStats(playerId, won = false) {
    const stmt = db.prepare(`
      UPDATE players
      SET games_played = games_played + 1,
          games_won = games_won + ?
      WHERE id = ?
    `);
    stmt.run(won ? 1 : 0, playerId);
  }

  static getAllPlayers() {
    const stmt = db.prepare('SELECT id, username, display_name, games_played, games_won FROM players');
    return stmt.all();
  }

  static deletePlayer(playerId) {
    const stmt = db.prepare('DELETE FROM players WHERE id = ?');
    stmt.run(playerId);
  }
}

export default db;
