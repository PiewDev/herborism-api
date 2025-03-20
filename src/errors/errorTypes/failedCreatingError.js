import { FAILED_CREATING_ERROR } from '../../utils/textConstants.js';

export class FailedCreatingError extends Error {
  constructor (message, entity, error = null) {
    super(`${message}: ${entity}`);
    this.name = FAILED_CREATING_ERROR;
    this.entity = entity;
    this.innerError = error;
  }
}
