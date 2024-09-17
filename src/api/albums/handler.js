const autoBind = require("auto-bind");
class AlbumsHandler {
  constructor(service, validator, like) {
    this._service = service;
    this._validator = validator;
    this._likesService = like;

    autoBind(this);
}

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: "success",
      message: "Album berhasil ditambahkan",
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: "success",
      message: "Data album sukses diambil",
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    const response = {
      status: "success",
      message: "Album berhasil diperbarui",
      data: {
        album: {
          id,
          ...request.payload,
        },
      },
    };
    return h.response(response).code(200);
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: "success",
      message: "Album berhasil dihapus",
    };
  }

  async postLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.verifyAlbumExists(albumId);
    await this._likesService.verifyLike(
      credentialId,
      albumId,
    );

    await this._likesService.addLike(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan',
    });

    response.code(201);
    return response;
  }

  async getUserAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    await this._service.verifyAlbumExists(albumId);

    const data = await this._likesService.getLikesByAlbumId(
      albumId,
    );

    const { likes, cache } = data;

    const response = h.response({
      status: 'success',
      data: {
        likes: Number(likes),
      },
    });

    if (cache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deleteUserAlbumLikeHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.verifyAlbumExists(albumId);

    await this._likesService.deleteLikeByAlbumIdAndUserId(
      albumId,
      credentialId,
    );

    return {
      status: 'success',
      message: 'Like berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
