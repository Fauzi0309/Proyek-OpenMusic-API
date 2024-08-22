const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, playlists.name, users.username
      ORDER BY playlists.id`,
      values: [owner],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Playlist gagal dihapus, Id tidak ditemukan");
    }
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Lagu gagal ditambahkan ke playlist");
    }
  }

  async getPlaylistSongById(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
        LEFT JOIN users ON playlists.owner = users.id WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const songQuery = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlists
      JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
      JOIN songs ON songs.id = playlist_songs.song_id WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    const resultSongs = await this._pool.query(songQuery);

    if (!result.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const allResult = {
      ...result.rows[0],
      songs: [...resultSongs.rows],
    };

    return allResult;
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Lagu gagal dihapus dari playlist");
    }
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError("Anda tidak memiliki akses ke playlist ini");
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylistActivityLog({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(15)}`;
    const time = new Date().toISOString();

    const query = {
      text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Aktivitas gagal ditambahkan");
    }
  }

  async getPlaylistActivityLogs(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
        FROM playlist_song_activities
        LEFT JOIN users ON users.id = playlist_song_activities.user_id
        LEFT JOIN songs ON songs.id = playlist_song_activities.song_id WHERE playlist_song_activities.playlist_id = $1
        ORDER BY playlist_song_activities.action`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return {
      playlistId, activities: result.rows,
    }
  }
}

module.exports = PlaylistService;
