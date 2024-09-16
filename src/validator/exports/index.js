const InvariantError = require("../../exceptions/InvariantError");
const ExportNotesPayloadSchema = require("./schema");

const ExportsValidator = {
  validateExportPlaylistPayload: (payload) => {
    const validationResult = ExportNotesPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
