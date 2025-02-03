import { FAILED_GETTING_ERROR } from '../../utils/textConstants.js';

export class FailedGettingError extends Error {
  constructor (message, entity, error = null) {
    super(`${message}: ${entity}`);
    this.name = FAILED_GETTING_ERROR;
    this.entity = entity;
    this.innerError = error;
  }
}
