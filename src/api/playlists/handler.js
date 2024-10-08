const autoBind = require("auto-bind");

class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });
    const response = h.response({
      status: "success",
      message: "Playlist berhasil ditambahkan",
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);
    const response = h.response({
      status: "success",
      data: {
        playlists,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);
    const response = h.response({
      status: "success",
      message: "Playlist berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const action = "add";

    await this._songsService.getSongById(songId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistsService.addPlaylistActivityLog({
      playlistId,
      songId,
      userId: credentialId,
      action,
    });
    await this._playlistsService.addPlaylistSong(playlistId, songId);

    const response = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan ke playlist",
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._playlistsService.getPlaylistSongById(id, credentialId);

    const response = h.response({
      status: "success",
      data: {
        playlist,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const action = 'delete';

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistsService.addPlaylistActivityLog({
      playlistId, songId, userId: credentialId, action,
    });
    await this._playlistsService.deletePlaylistSong(playlistId, songId);

    const response = h.response({
      status: "success",
      message: "Playlist berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  async getPlaylistActivityLogsHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    const { playlistId, activities } = await this._playlistsService.getPlaylistActivityLogs(id);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;
