const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const { mapDBToModelAllSong } = require("../../utils");

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getAllSongs(title, performer) {
    let text = "SELECT id, title, performer FROM songs";
    const values = [];

    if (title) {
      text += " WHERE title ILIKE '%' || $1 || '%'";
      values.push(title);
    }

    if (title && performer) {
      text += " AND performer ILIKE '%' || $2 || '%'";
      values.push(performer);
    }

    if (!title && performer) {
      text += " WHERE performer ILIKE '%' || $1 || '%'";
      values.push(performer);
    }

    const query = {
      text,
      values,
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelAllSong);
  }
}

module.exports = SongService;
