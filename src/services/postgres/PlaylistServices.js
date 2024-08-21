const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.owner = $1
      GROUP BY playlists.id, playlists.name, users.username
      ORDER BY playlists.id`,
      values: [owner],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus, Id tidak ditemukan');
    }
  }

  async addPlaylistSong(playlistId, songId) {
        const id = `playlist-song-${nanoid(16)}`;
        const query = {
          text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
          values: [id, playlistId, songId],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rowCount) {
          throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }   
  }

  async verifyPlaylistOwner(playlistId, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [playlistId],
          };
      
          const result = await this._pool.query(query);
      
          if (!result.rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan');
          }
      
          if (result.rows[0].owner !== owner) {
            throw new AuthorizationError('Anda tidak memiliki akses ke playlist ini');
          }
    }

    async verifyPlaylistAccess(playlistId, owner) {
        try {
          await this.verifyPlaylistOwner(playlistId, owner);
        } catch (error) {
          if (error instanceof NotFoundError) {
            throw error;
          } else if (error instanceof AuthorizationError) {
            throw error;
          } else {
            console.log(error);
          }
        }
      }

}

module.exports = PlaylistService;