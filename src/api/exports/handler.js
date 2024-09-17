const autoBind = require("auto-bind");

class ExportsHandler {
  constructor(exportService, validator, playlistsService) {
    this._exportService = exportService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    // this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    const { playlistId: id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    this._validator.validateExportPlaylistPayload(request.payload);

    const message = {
      playlistId: id,
      userId: credentialId,
      targetEmail: request.payload.targetEmail,
    };

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._exportService.sendMessage("export:playlist", JSON.stringify(message));

    const response = h.response({
      status: "success",
      message: "Permintaan Anda sedang kami proses",
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
