const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");

class LikeService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    const id = `likes-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new Error("User album like gagal ditambahkan");
    }

    await this._cacheService.delete(`userAlbumLikes:${albumId}`);
  }

  async verifyLike(userId, albumId) {
    const query = {
      text: "SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length) {
      throw new InvariantError("Gagal menambahkan like. User sudah memberikan like.");
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikesByAlbumId(albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);

      return { likes: JSON.parse(result), cache: true };
    } catch (error) {
      const query = {
        text: "SELECT COUNT(album_id) FROM user_album_likes WHERE album_id = $1",
        values: [albumId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(result.rows[0].count), 60 * 30);

      return { likes: Number(result.rows[0].count), cache: false };
    }
  }

  async deleteLikeByAlbumIdAndUserId(albumId, userId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id",
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal menghapus like. Like tidak ditemukan");
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }
}

module.exports = LikeService;
