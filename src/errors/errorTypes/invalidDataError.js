import { INVALID_DATA_ERROR } from '../../utils/textConstants.js';

export class InvalidDataError extends Error {
  constructor (message, entity) {
    super(message);
    this.name = INVALID_DATA_ERROR;
    this.entity = entity;
  }
}
