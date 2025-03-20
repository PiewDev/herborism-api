import { DOES_NOT_EXIST_ERROR } from '../../utils/textConstants.js';

export class DoesNotExistError extends Error {
  constructor (message, entity) {
    super(message);
    this.name = DOES_NOT_EXIST_ERROR;
    this.entity = entity;
  }
}
