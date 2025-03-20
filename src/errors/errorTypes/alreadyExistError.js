import { ALREADY_EXIST_ERROR } from '../../utils/textConstants.js';

export class AlreadyExistError extends Error {
  constructor (message, entity) {
    super(message);
    this.name = ALREADY_EXIST_ERROR;
    this.entity = entity;
  }
}
