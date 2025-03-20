import { FAILED_ADDING_ERROR } from '../../utils/textConstants.js';

export class FailedAddingError extends Error {
  constructor (message, entity, error = null) {
    super(`${message}: ${entity}`);
    this.name = FAILED_ADDING_ERROR;
    this.entity = entity;
    this.innerError = error;
  }
}
