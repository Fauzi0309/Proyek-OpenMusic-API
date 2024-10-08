const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { nanoid } = require("nanoid");
const { mapDBToModelAlbumDetail } = require("../../utils");

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Album gagal ditemukan");
    }
    const album = result.rows[0];
    const querySong = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [album.id],
    };
    const songs = await this._pool.query(querySong);
    if (songs.rowCount) {
      album.songs = songs.rows;
    } else {
      album.songs = [];
    }
    return mapDBToModelAlbumDetail(result.rows[0]);
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }

  async editCoverAlbumById(id, coverUrl) {
    // const updateAt = new Date().toISOString();
    // const query = {
    //   text: "UPDATE albums SET cover=$2, updated_at=$3 WHERE id=$1 RETURNING id",
    //   values: [id, coverUrl, updateAt],
    // };
    const query = {
      text: "UPDATE albums SET cover=$2 WHERE id=$1 RETURNING id",
      values: [id, coverUrl],
    };
    //console.log(query);
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Update Failed. Id Not Found");
    }
  }

  async verifyAlbumExists(id) {
    const query = {
      text: "SELECT id FROM albums WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }
  }
}

module.exports = AlbumService;
