const ExportMusicPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');
 
const ExportsValidator = {
  validateExportNotesPayload: (payload) => {
    const validationResult = ExportMusicPayloadSchema.validate(payload);
 
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};
 
module.exports = ExportsValidator;