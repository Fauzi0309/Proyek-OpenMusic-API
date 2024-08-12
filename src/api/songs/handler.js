const autoBind = require("auto-bind");

class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { title, year, genre, performer, duration, albumId } = request.payload;

    const songId = await this._service.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    const response = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan",
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getAllSongHandler(request) {
    const { title = null, performer = null } = request.query;
    const songs = await this._service.getAllSongs(title, performer);
    return {
      status: "success",
      message: "Data Lagu sukses diambil",
      data: {
        songs,
      },
    };
  }
}

module.exports = SongHandler;
